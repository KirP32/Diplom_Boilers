const jwt = require("jsonwebtoken");
const pool = require("../dataBase/pool");
const { getTokens } = require("../getTokens");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const e = require("express");
require("dotenv").config();

class DataController {
  async changes(req, res, next) {
    try {
      const key = req.query.key;
      console.log(`Received key: ${key}`);

      let str = `SELECT temperature, id FROM boilerinfo WHERE key = $1`;
      pool.query(str, [key], (err, result) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          console.log(result.rows);
          res.json(result.rows);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  async test(req, res, next) {
    console.log("Test route working");
    res.status(200).send("Test route working");
  }

  async devices(req, res, next) {
    const devices = [
      {
        id: 1,
        name: "floor1",
        status: "online",
        boilers: [
          { name: "Котёл основной", t: 65, online: "15h 5m 10s" },
          { name: "Котёл гараж", t: 100, online: "1h 4m 55s" },
          { name: "Крыша", t: 47, online: "6h 14m 31s" },
        ],
      },
      { id: 2, name: "bath2", status: "error" },
      { id: 3, name: "garage", status: "check" },
      { id: 4, name: "bathroom", status: "check" },
      { id: 5, name: "Pool", status: "check" },
      { id: 6, name: "hatch", status: "error" },
    ];
    res.json(devices);
  }

  async refresh(req, res, next) {
    try {
      const token = req.cookies.refreshToken;
      const UUID4 = req.cookies.UUID4;
      const RememberMe = req.query.stay_logged === "true";

      if (!token || !UUID4) {
        console.error("Refresh token not provided or UUID4");
        return res
          .status(401)
          .send("UnauthorizedError: No token provided or UUID4");
      }

      let token_data;

      try {
        token_data = jwt.verify(token, process.env.JWT_REFRESH_KEY);
      } catch (e) {
        token_data = null;
        return res.status(401).send("TokenExpired");
      }

      if (!token_data) {
        return res.status(401).send("UnauthorizedError");
      }

      const userQuery = await pool.query(
        "SELECT access_level FROM users WHERE username = $1",
        [token_data.login]
      );

      if (userQuery.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const access_level = userQuery.rows[0].access_level;
      const { accessToken, refreshToken } = getTokens(
        token_data.login,
        access_level,
        RememberMe,
        token,
        token_data.userID
      );

      await updateToken(token_data.login, refreshToken, UUID4);

      const maxAge = RememberMe ? 31 * 24 * 60 * 60 * 1000 : 1000 * 60 * 60 * 2;

      res.cookie("refreshToken", refreshToken, {
        maxAge,
        httpOnly: true,
        sameSite: "Strict",
      });
      return res.send({ accessToken });
    } catch (error) {
      console.error("Error in refresh token route:", error);
      return res.status(500).send("Internal Server Error");
    }
  }

  async login(req, res, next) {
    const { login, password, RememberMe } = req.body;
    let { UUID4 } = req.body;
    const oldUUID4 = req.cookies.UUID4;

    if (oldUUID4) {
      UUID4 = oldUUID4;
    }
    const str = "SELECT password_hash FROM USERS WHERE username = $1";
    pool.query(str, [login], async (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
      if (result.rows.length === 0) {
        return res.status(400).json({ error: "User not found" });
      }

      const pass_hash = result.rows[0].password_hash;
      const isValid = await bcrypt.compare(password, pass_hash);

      if (isValid) {
        const access_level = (
          await pool.query(
            "SELECT access_level FROM users WHERE username = $1",
            [login]
          )
        ).rows[0].access_level;
        const userID = await getID(login);
        const { accessToken, refreshToken } = getTokens(
          login,
          access_level,
          RememberMe,
          "",
          userID
        );

        await updateToken(login, refreshToken, UUID4);

        if (RememberMe) {
          res.cookie("refreshToken", refreshToken, {
            maxAge: 31 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "Strict",
          });
        } else {
          res.cookie("refreshToken", refreshToken, {
            sameSite: "Strict",
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 2,
          });
        }
        res.cookie("UUID4", UUID4, {
          httpOnly: true,
          sameSite: "Strict",
          maxAge: 31 * 24 * 60 * 60 * 1000,
        });
        res.send({ accessToken });
      } else {
        res.status(400).json({ error: "Invalid credentials" });
      }
    });
  }

  async sign_up(req, res, next) {
    const { login, password, email, access_level } = req.body;
    const hash = bcrypt.hashSync(password);
    const authcookie = req.headers["accesstoken"];

    try {
      await pool.query("BEGIN");

      const userResult = await pool.query(
        "INSERT INTO users (username, phone_number, password_hash, access_level, email) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [login, "123456789", hash, access_level, email]
      );

      if (userResult.rowCount > 0) {
        let tableName = "";
        switch (parseInt(access_level)) {
          case 0:
            tableName = "user_details";
            break;
          case 1:
            tableName = "worker_details";
            break;
          case 2:
            tableName = "cgs_details";
            break;
          case 3:
            tableName = "gef_details";
            break;
          default:
            await pool.query("ROLLBACK");
            return res.status(400).send("Некорректный уровень доступа");
        }

        await pool.query(`INSERT INTO ${tableName} (username) VALUES ($1)`, [
          login,
        ]);

        const data = {
          user_id: await getID(decodeJWT(authcookie).login),
          action: "Добавлен пользователь",
          time: new Date(),
          subject_id: await getID(login),
        };
        await log_history(data);

        await pool.query("COMMIT");
        res.send("OK");
      } else {
        await pool.query("ROLLBACK");
        res.sendStatus(500);
      }
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error("Ошибка при регистрации:", error);
      res.sendStatus(500);
    }
  }

  async logout(req, res, next) {
    const { refreshToken, UUID4 } = req.cookies;
    if (UUID4) {
      await deleteCookieDB(refreshToken, UUID4);
    }

    res.clearCookie("refreshToken", { httpOnly: true });
    res.status(200).send({ message: "Logged out successfully" });
  }

  async info(req, res, next) {
    console.log(req.body);
    const { boiler_key } = req.body;
    const { id } = req.body;
    const { lastchanges } = req.body;
    console.log("Received POST request on /info");
    console.log(req.body);
    if (boiler_key == key) {
      console.log("--key accepted--");
      let str = "UPDATE boilerinfo SET lastchanges = $1 WHERE id = $2";
      pool.query(str, [lastchanges, id], (err, result) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          console.log("Data added to DB");
          console.log(req.body);
          res.status(200).send("Данные успешно приняты");
        }
      });
    } else {
      res.status(400).send("Некорректный ключ");
    }
  }

  async test_esp(req, res, next) {
    try {
      const api = req.headers["authorization"];
      await axios
        .get("http://185.113.139.204:8000/module/get/0-00002", {
          headers: {
            Authorization: api,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          res.send(response.data);
        });
    } catch (error) {
      console.log(error.message);
    }
  }

  async off_esp(req, res, next) {
    const api = req.headers["authorization"];
    const { indicator } = req.body;
    const url = `http://185.113.139.204:8000/module/serial/0-00002/command=${indicator}`;
    await axios
      .put(
        url,
        {},
        {
          headers: {
            Authorization: api,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("Ошибка на сервере");
      });
  }

  async add_device(req, res, next) {
    const { login, device_uid } = req.body;
    try {
      const pquery = await pool.query(
        "SELECT id FROM devices WHERE device_uid = $1",
        [device_uid]
      );
      if (pquery.rowCount === 0) {
        const error = new Error();
        error.code = 23500;
        throw error;
      }
      const id = await getID(login);
      if (id.code) {
        const error = new Error();
        error.code = id.code;
        throw error;
      }
      const str = `
                INSERT INTO user_devices (user_id, device_id) 
                VALUES (
                    $1, 
                    (SELECT id FROM devices WHERE device_uid = $2)
                );`;

      const result = await pool.query(str, [id, device_uid]);
      if (result.rowCount > 0) {
        const data = {
          user_id: await getID(decodeJWT(req.headers["accesstoken"]).login),
          action: `Добавлено устройство ${device_uid}`,
          time: new Date(),
          subject_id: await getID(login),
        };
        await log_history(data);
        console.log("Device added to user", login);
        return res.status(200).send("Устройство добавлено");
      }
    } catch (error) {
      if (error.code == "23502") {
        res.send({ code: 23502 });
      } else if (error.code == "23505") {
        res.send({ code: 23505 });
      } else if (error.code == "23500") {
        res.send({ code: 23500 });
      }
    }
  }

  async getUser_info(req, res, next) {
    console.log("getUser_info");
    const { login } = req.body;
    const check_user = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [login]
    );
    if (check_user.rowCount === 1) {
      const { id } = check_user.rows[0];
      const str = `SELECT device_uid
                    FROM user_devices
                    JOIN devices ON device_id = id
                    WHERE user_id = $1;`;
      pool.query(str, [id], (err, result) => {
        if (err) {
          console.log(`Ошибка в getUser_info с юзером ${login}`);
        } else {
          return res.send({ devices: result.rows });
        }
      });
    } else {
      return res.send({ error: "User not found" });
    }
  }

  async delete_device(req, res, next) {
    const { device_uid } = req.params;
    const login = req.headers["login"];
    try {
      const deviceResult = await pool.query(
        "SELECT id FROM devices WHERE device_uid = $1",
        [device_uid]
      );

      if (deviceResult.rowCount === 0) {
        return res.status(404).send("Устройство с таким UID не найдено");
      }

      const deviceId = deviceResult.rows[0].id;

      const deleteResult = await pool.query(
        "DELETE FROM user_devices WHERE device_id = $1",
        [deviceId]
      );

      if (deleteResult.rowCount > 0) {
        res.send("OK");
        const data = {
          user_id: await getID(decodeJWT(req.headers["accesstoken"]).login),
          action: `Удалено устройство ${device_uid}`,
          time: new Date(),
          subject_id: await getID(login),
        };
        await log_history(data);
      } else {
        res.status(404).send("Запись в user_devices не найдена");
      }
    } catch (err) {
      console.error("Ошибка при удалении устройства:", err);
      res.status(500).send("Ошибка сервера");
    }
  }

  async getActions(req, res, next) {
    try {
      const authtoken = req.headers["accesstoken"];
      const id = await getID(decodeJWT(authtoken).login);
      const actionArr = await pool.query(
        `SELECT ac.action, ac.time, u.username 
                        FROM actions_control ac 
                        JOIN users u ON ac.subject_id = u.id
                        WHERE ac.user_id = $1;`,
        [id]
      );
      if (actionArr.rowCount < 1) {
        res.send([null]);
      } else {
        res.send(actionArr.rows);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getUser_email(req, res, next) {
    try {
      const authtoken = req.headers["accesstoken"];
      const login = decodeJWT(authtoken).login;
      const { access_level } = req.body;

      const tables = {
        0: "user_details",
        1: "worker_details",
        2: "cgs_details",
        3: "gef_details",
      };

      const detailsTable = tables[access_level];

      if (!detailsTable) {
        return res.status(400).send({ error: "Некорректный уровень доступа" });
      }

      const result = await pool.query(
        `SELECT u.email, ud.*
         FROM users u
         JOIN ${detailsTable} ud ON u.username = ud.username
         WHERE u.username = $1`,
        [login]
      );

      res.send(result.rows.length > 0 ? result.rows[0] : {});
    } catch (error) {
      console.log("catched error", error);
      res.sendStatus(500);
    }
  }

  async getSystems(req, res) {
    try {
      const api = req.headers["authorization"];
      const login = decodeJWT(req.cookies.refreshToken).login;

      const request = await pool.query(
        `SELECT * FROM user_systems WHERE user_id = (
          SELECT id FROM users WHERE username = $1
        );`,
        [login]
      );

      const systems = request.rows;
      if (!systems.length) {
        return res.send([]);
      }

      const apiRequests = systems.map((system) => {
        if (system.name === "ADS-Line") {
          return axios
            .get(`http://185.113.139.204:8000/module/get/${system.name}`, {
              headers: {
                Authorization: api,
                "Content-Type": "application/json",
              },
            })
            .then((response) => response.data)
            .catch((error) => {
              console.error(
                `Ошибка при получении ${system.name}:`,
                error.message
              );
              return {
                user_id: system.user_id,
                name: system.name,
                system_id: system.system_id,
              };
            });
        } else {
          // Заглушка для систем, не являющихся "ADS-Line"
          return Promise.resolve({
            user_id: system.user_id,
            name: system.name,
            system_id: system.system_id,
            module_list: [],
          });
        }
      });

      const fetchedSystems = await Promise.all(apiRequests);

      const fooArray = [
        {
          name: "Центральный р-н. 55",
          s_number: "SB_00002",
          id: 2,
          module_list: [
            { s_number: "Котёл основной", data: "80° стабильно", type: 2 },
            { s_number: "Резервный контур", data: "Стабильно", type: 1 },
            {
              s_number: "Бойлер основной",
              data: "Возможен сбой, проверьте оборудование",
              type: 1,
            },
          ],
        },
        {
          name: "Северный р-н. 12",
          s_number: "SB_00003",
          id: 3,
          module_list: [
            { s_number: "Котёл основной", data: "75° стабильно", type: 2 },
            { s_number: "Резервный контур", data: "Неактивен", type: 1 },
            {
              s_number: "Бойлер основной",
              data: "Работает в штатном режиме",
              type: 1,
            },
            {
              s_number: "Насосная станция",
              data: "Требуется профилактика",
              type: 2,
            },
          ],
        },
        {
          name: "Южный р-н. 7",
          s_number: "SB_00004",
          id: 4,
          module_list: [
            { s_number: "Котёл основной", data: "85° стабильно", type: 2 },
            {
              s_number: "Резервный контур",
              data: "Включён, работает в штатном режиме",
              type: 1,
            },
            {
              s_number: "Бойлер основной",
              data: "Температура ниже нормы, проверьте настройки",
              type: 1,
            },
            {
              s_number: "Система вентиляции",
              data: "Работает стабильно",
              type: 0,
            },
          ],
        },
      ];

      const selectedSystems = systems
        .map((system) => fooArray.find((item) => item.name === system.name))
        .filter(Boolean);

      const uniqueSystems = [
        ...new Map(
          [...fetchedSystems, ...selectedSystems].map((s) => [s.name, s])
        ).values(),
      ];

      return res.send(uniqueSystems);
    } catch (error) {
      console.error("Ошибка при получении систем:", error);
      return res.status(500).send("Server Error: cant get Boilers Systems");
    }
  }

  async getSystemRequests(req, res) {
    try {
      const { name } = req.query;
      await pool
        .query(
          `SELECT 
                id, 
                problem_name,
                status,
                assigned_to,
                system_name,
                module
             FROM 
                user_requests
             WHERE 
                 system_name = $1`,
          [name]
        )
        .catch((error) => {
          console.log(error);
          res.sendStatus(500);
        })
        .then((result) => {
          const decoded = decodeJWT(req.cookies.refreshToken);
          if (
            decoded.access_level === 0 ||
            decoded.access_level === 2 ||
            decoded.access_level === 3
          ) {
            res.send(result.rows);
          } else {
            res.send(
              result.rows
                .map(
                  (item) =>
                    item.assigned_to === decoded.userID ? { ...item } : null
                  // : {
                  //     description: item.description,
                  //     id: item.id,
                  //     module: item.module,
                  //     phone_number: item.phone_number,
                  //     problem_name: item.problem_name,
                  //     stage: item.stage,
                  //     status: item.status,
                  //     system_name: item.system_name,
                  //     type: item.type,
                  //   }
                )
                .filter((item) => item !== null)
            );
          }
        });
    } catch (error) {
      console.log(error);
    }
  }

  async createRequest(req, res) {
    try {
      const {
        problem_name,
        module,
        created_by,
        description,
        system_name,
        phone,
        created_by_worker,
        access_level,
        additional_data,
        assigned_to_wattson, // региональный
        assigned_to_worker, // работник от АСЦ
      } = req.body;
      let { type } = req.body;
      if (!type) {
        type = 0;
      }

      const createdById = await getID(created_by);

      let assignedWorkerId = null;
      let assignedRegionalWorkerId = null;

      assignedRegionalWorkerId = assigned_to_wattson
        ? await getID(assigned_to_wattson)
        : null;
      assignedWorkerId = assigned_to_worker
        ? await getID(assigned_to_worker)
        : null;

      let worker_confirmed = false;

      if (access_level === 1) {
        assignedWorkerId = createdById;
        worker_confirmed = true;
      }

      const result = await pool.query(
        `INSERT INTO user_requests 
          (problem_name, type, status, assigned_to, region_assigned_to, created_at, module, created_by, description, system_name, phone_number, created_by_worker, gef_assigned_to)
        VALUES 
          ($1, $8, 0, $9, $10, current_timestamp, $2, $3, $4, $5, $6, $7, $11)
        RETURNING id`,
        [
          problem_name,
          module,
          createdById,
          description,
          system_name,
          phone,
          created_by_worker,
          type,
          assignedWorkerId,
          assignedRegionalWorkerId,
          access_level === 3 ? createdById : null,
        ]
      );

      if (result.rowCount !== 1) {
        return res.status(500).send({ error: "Ошибка при создании заявки" });
      }

      const requestId = result.rows[0].id;

      await pool.query(
        `INSERT INTO user_requests_info (request_id, additional_info, created_at, worker_confirmed, wattson_confirmed)
        VALUES ($1, $2, current_timestamp, $3, FALSE)`,
        [requestId, problem_name, worker_confirmed]
      );

      return res.sendStatus(200);
    } catch (error) {
      console.error("Ошибка при выполнении запроса:", error);
      res.status(500).send({ error: "Ошибка при создании заявки" });
    }
  }

  async getRequests(req, res, next) {
    try {
      const login = decodeJWT(req.cookies.refreshToken).login;
      const user = await pool.query(
        "SELECT id, access_level FROM users WHERE username = $1",
        [login]
      );

      if (user.rowCount === 0) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      const { id, access_level } = user.rows[0];

      let assignedField = "";
      let confirmedField = "";

      if (access_level === 1) {
        assignedField = "assigned_to";
        confirmedField = "worker_confirmed";
      } else if (access_level === 2) {
        assignedField = "region_assigned_to";
        confirmedField = "wattson_confirmed";
      } else if (access_level === 3) {
        assignedField = "gef_assigned_to";
        confirmedField = "gef_confirmed";
      } else {
        return res.status(403).json({ error: "Недостаточно прав" });
      }

      let allDevicesQuery = "";
      let workerDevicesQuery = "";
      let queryParams = [];

      if (access_level === 3) {
        // Для GEFFEN: allDevices – заявки, где gef_assigned_to IS NULL,
        // workerDevices – заявки, где gef_assigned_to равен ID пользователя
        allDevicesQuery = `
          SELECT ur.id, ur.description, ur.phone_number, ur.module, ur.problem_name, ur.status, 
                 ur.${assignedField}, ur.system_name, ur.created_at
          FROM user_requests ur
          JOIN user_requests_info uri ON ur.id = uri.request_id
          WHERE ur.${assignedField} IS NULL AND uri.${confirmedField} = FALSE AND ur.status != 1
        `;
        workerDevicesQuery = `
          SELECT ur.id, ur.description, ur.phone_number, ur.module, ur.problem_name, ur.status, 
                 ur.${assignedField}, ur.system_name, ur.created_at
          FROM user_requests ur
          JOIN user_requests_info uri ON ur.id = uri.request_id
          WHERE ur.${assignedField} = $1 AND ur.status = 0
        `;
        queryParams = [id];
      } else {
        // Для других уровней: обычное условие по равенству поля
        allDevicesQuery = `
          SELECT ur.id, ur.description, ur.phone_number, ur.module, ur.problem_name, ur.status, 
                 ur.${assignedField}, ur.system_name, ur.created_at
          FROM user_requests ur
          JOIN user_requests_info uri ON ur.id = uri.request_id
          WHERE ur.${assignedField} = $1 AND uri.${confirmedField} = FALSE AND ur.status != 1
        `;
        workerDevicesQuery = `
          SELECT ur.id, ur.description, ur.phone_number, ur.module, ur.problem_name, ur.status, 
                 ur.${assignedField}, ur.system_name, ur.created_at
          FROM user_requests ur
          JOIN user_requests_info uri ON ur.id = uri.request_id
          WHERE ur.${assignedField} = $1 AND uri.${confirmedField} = TRUE AND ur.status = 0
        `;
        queryParams = [id];
      }

      const allDevices = await pool.query(
        allDevicesQuery,
        access_level === 3 ? [] : queryParams
      );

      const workerDevices = await pool.query(workerDevicesQuery, queryParams);

      const resultData = {
        allDevices: allDevices.rowCount > 0 ? allDevices.rows : [],
        workerDevices: workerDevices.rowCount > 0 ? workerDevices.rows : [],
      };

      res.send(resultData);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async addRequest(req, res, next) {
    try {
      const { system_name, user, request_id, systems_names } = req.body;

      const userQuery = await pool.query(
        "SELECT id, access_level FROM users WHERE username = $1",
        [user]
      );
      if (userQuery.rowCount === 0) {
        return res.status(404).json({ message: "Пользователь не найден." });
      }
      const { id: userId, access_level } = userQuery.rows[0];

      let updateResult;

      if (access_level === 3) {
        updateResult = await pool.query(
          "UPDATE user_requests SET gef_assigned_to = $1 WHERE id = $2",
          [userId, request_id]
        );
        if (updateResult.rowCount === 0) {
          return res
            .status(400)
            .json({ message: "Заявка уже принята или не существует." });
        }
      } else if (access_level === 1) {
        updateResult = await pool.query(
          "UPDATE user_requests_info SET worker_confirmed = TRUE WHERE request_id = $1",
          [request_id]
        );
        if (updateResult.rowCount === 0) {
          return res
            .status(400)
            .json({ message: "Заявка не найдена или уже принята." });
        }
      } else if (access_level === 2) {
        updateResult = await pool.query(
          "UPDATE user_requests_info SET wattson_confirmed = TRUE WHERE request_id = $1",
          [request_id]
        );
        if (updateResult.rowCount === 0) {
          return res
            .status(400)
            .json({ message: "Заявка не найдена или уже принята." });
        }
      } else {
        return res
          .status(403)
          .json({ message: "Недостаточно прав для принятия заявки." });
      }

      let resultSystem = { rowCount: 1 };
      if (!systems_names.includes(system_name)) {
        resultSystem = await pool.query(
          "INSERT INTO user_systems (user_id, name) VALUES ($1, $2)",
          [userId, system_name]
        );
      }

      if (resultSystem.rowCount > 0) {
        return res.sendStatus(200);
      } else {
        return res
          .status(200)
          .json({ message: "Система не была добавлена (уже существует)." });
      }
    } catch (error) {
      console.error(error);
      if (error.code === "23505") {
        return res.status(409).json({ message: "Система уже существует." });
      } else {
        return res.status(500).json({ message: "Внутренняя ошибка сервера." });
      }
    }
  }

  async removeRequestFrom(req, res, next) {
    try {
      const { id } = req.params;
      const user = decodeJWT(req.cookies.refreshToken).login;

      const userQuery = await pool.query(
        "SELECT id, access_level FROM users WHERE username = $1",
        [user]
      );
      if (userQuery.rowCount === 0) {
        return res.status(404).json({ message: "Пользователь не найден." });
      }
      const { id: user_id, access_level } = userQuery.rows[0];

      let system_name;
      let updateResult;

      if (access_level === 3) {
        updateResult = await pool.query(
          "UPDATE user_requests SET gef_assigned_to = NULL WHERE id = $1 RETURNING system_name",
          [id]
        );
        if (updateResult.rowCount === 0) {
          return res
            .status(400)
            .json({ message: "Заявка уже удалена или не существует." });
        }
        system_name = updateResult.rows[0].system_name;
      } else if (access_level === 1) {
        updateResult = await pool.query(
          "UPDATE user_requests_info SET worker_confirmed = FALSE WHERE request_id = $1 RETURNING request_id",
          [id]
        );
        if (updateResult.rowCount === 0) {
          return res
            .status(400)
            .json({ message: "Заявка не найдена или уже удалена." });
        }
        const sysRes = await pool.query(
          "SELECT system_name FROM user_requests WHERE id = $1",
          [id]
        );
        if (sysRes.rowCount > 0) {
          system_name = sysRes.rows[0].system_name;
        }
      } else if (access_level === 2) {
        updateResult = await pool.query(
          "UPDATE user_requests_info SET wattson_confirmed = FALSE WHERE request_id = $1 RETURNING request_id",
          [id]
        );
        if (updateResult.rowCount === 0) {
          return res
            .status(400)
            .json({ message: "Заявка не найдена или уже удалена." });
        }
        const sysRes = await pool.query(
          "SELECT system_name FROM user_requests WHERE id = $1",
          [id]
        );
        if (sysRes.rowCount > 0) {
          system_name = sysRes.rows[0].system_name;
        }
      } else {
        return res
          .status(403)
          .json({ message: "Недостаточно прав для удаления заявки." });
      }

      let checkQuery = "";
      let checkParams = [];
      if (access_level === 3) {
        checkQuery =
          "SELECT COUNT(*) FROM user_requests WHERE gef_assigned_to = $1 AND system_name = $2";
        checkParams = [user_id, system_name];
      } else if (access_level === 1) {
        checkQuery = `
          SELECT COUNT(*) 
          FROM user_requests ur
          JOIN user_requests_info uri ON ur.id = uri.request_id
          WHERE ur.assigned_to = $1 AND ur.system_name = $2 AND uri.worker_confirmed = TRUE
        `;
        checkParams = [user_id, system_name];
      } else if (access_level === 2) {
        checkQuery = `
          SELECT COUNT(*) 
          FROM user_requests ur
          JOIN user_requests_info uri ON ur.id = uri.request_id
          WHERE ur.region_assigned_to = $1 AND ur.system_name = $2 AND uri.wattson_confirmed = TRUE
        `;
        checkParams = [user_id, system_name];
      }

      const checkRequests = await pool.query(checkQuery, checkParams);
      const remainingCount = Number(checkRequests.rows[0].count);

      if (remainingCount === 0) {
        const deleteSystem = await pool.query(
          "DELETE FROM user_systems WHERE user_id = $1 AND name = $2",
          [user_id, system_name]
        );
        if (deleteSystem.rowCount > 0) {
          return res.send("OK");
        } else {
          return res
            .status(400)
            .json({ message: "Ошибка при удалении системы." });
        }
      }

      return res.send("Removed");
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Внутренняя ошибка сервера." });
    }
  }

  async deleteRequest(req, res) {
    try {
      const { id: requestId, system_name } = req.params;
      const username = decodeJWT(req.cookies.refreshToken)?.login;
      if (!requestId || !system_name || !username) {
        return res.status(400).json({ message: "Неверный формат запроса" });
      }
      const systemCheck = await pool.query(
        `SELECT 1 FROM user_systems 
         WHERE user_id = (SELECT id FROM users WHERE username = $1) 
         AND name = $2`,
        [username, system_name]
      );

      if (systemCheck.rowCount === 0) {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const requestData = await pool.query(
        `SELECT assigned_to FROM user_requests WHERE id = $1`,
        [requestId]
      );

      if (requestData.rowCount === 0) {
        return res.status(404).json({ message: "Заявка не найдена" });
      }

      const workerId = requestData.rows[0].assigned_to;

      if (!workerId) {
        const updateResult = await pool.query(
          `UPDATE user_requests SET status = 1 WHERE id = $1`,
          [requestId]
        );

        if (updateResult.rowCount === 0) {
          return res.status(404).json({ message: "Ошибка с заявкой" });
        }

        return res.status(200).json({ message: "Запись успешно обновлена" });
      }

      const activeRequests = await pool.query(
        `SELECT COUNT(*) as count 
         FROM user_requests 
         WHERE assigned_to = $1 
           AND system_name = $2 
           AND status = 0 
           AND id != $3`,
        [workerId, system_name, requestId]
      );

      if (Number(activeRequests.rows[0].count) === 0) {
        await pool.query(
          `DELETE FROM user_systems 
           WHERE user_id = $1 AND name = $2`,
          [workerId, system_name]
        );
      }

      const updateResult = await pool.query(
        `UPDATE user_requests SET status = 1 WHERE id = $1`,
        [requestId]
      );

      if (updateResult.rowCount === 0) {
        return res.status(404).json({ message: "Заявка не найдена" });
      }

      return res.status(200).json({ message: "Операция выполнена успешно" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Внутренняя ошибка сервера", error: error });
    }
  }

  async getAllSystems(req, res) {
    try {
      //console.log("getAllSystems called");
      const user_id = await getID(decodeJWT(req.cookies.refreshToken).login);
      const data = await pool.query(
        `
        SELECT s.*
        FROM systems s
        WHERE NOT EXISTS (
          SELECT 1
          FROM user_systems us
          WHERE us.name = s.name
            AND us.user_id = $1
        )
      `,
        [user_id]
      );
      return res.send(data.rows);
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  }
  async addSystem(req, res) {
    try {
      const { systemName } = req.body;
      const user_id = await getID(decodeJWT(req.cookies.refreshToken).login);
      const result = await pool.query(
        "insert into user_systems values ($1, $2)",
        [user_id, systemName]
      );
      if (result.rowCount > 0) {
        return res.send("OK");
      } else {
        return res.status(500);
      }
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  }
  async deleteSystem(req, res) {
    try {
      const { name: system_name } = req.params;
      const user_id = await getID(decodeJWT(req.cookies.refreshToken).login);
      const result = await pool.query(
        "DELETE FROM user_systems WHERE user_id = $1 AND name = $2",
        [user_id, system_name]
      );
      if (result.rowCount > 0) {
        return res.sendStatus(200);
      } else {
        return res.status(500).send({ message: "Ошибка удаления системы" });
      }
    } catch (error) {
      return res.send(error);
    }
  }
  async getRequestButtonsStatus(req, res) {
    try {
      const { id } = req.query;
      const result = await pool.query(
        "select user_confirmed, worker_confirmed, regional_confirmed, service_engineer_confirmed, action from request_confirmations where request_id = $1",
        [id]
      );
      if (result.rows.length > 0) {
        const {
          user_confirmed,
          worker_confirmed,
          regional_confirmed,
          service_engineer_confirmed,
          action,
        } = result.rows[0];
        return res.send({ user_confirmed, worker_confirmed, action });
      }
    } catch (error) {}
  }
  async getDatabaseColumns(req, res) {
    try {
      const result_workers = await pool.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'worker_details';`
      );
      const result_users = await pool.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_details';`
      );
      const result_cgs = await pool.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cgs_details';`
      );
      const result_gef = await pool.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'gef_details';`
      );
      const result_requests = await pool.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_requests_info';`
      );
      const result_materials = await pool.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'materials_stage';`
      );
      const result_in_transit = await pool.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'in_transit_stage';`
      );
      const result_work_in_progress = await pool.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'work_in_progress_stage';`
      );

      if (
        result_workers.rowCount > 0 &&
        result_users.rowCount > 0 &&
        result_cgs.rowCount > 0 &&
        result_gef.rowCount > 0 &&
        result_requests.rowCount > 0
      ) {
        return res.send({
          worker_details: result_workers.rows,
          user_details: result_users.rows,
          cgs_details: result_cgs.rows,
          gef_details: result_gef.rows,
          user_requests_info: result_requests.rows,
          materials_stage: result_materials.rows,
          in_transit_stage: result_in_transit.rows,
          work_in_progress_stage: result_work_in_progress.rows,
        });
      }
      return res.sendStatus(400);
    } catch (error) {
      res.status(400).send(error);
    }
  }
  async updateDatabaseColumn(req, res) {
    try {
      const { oldName, newName, tableName } = req.body;

      if (!oldName || !newName) {
        return res.sendStatus(400);
      }

      const query = `ALTER TABLE "${tableName}" RENAME COLUMN "${oldName}" TO "${newName}"`;

      await pool.query(query);
      return res.sendStatus(200);
    } catch (error) {
      console.log("ошибка:", error);
      return res.status(400).send(error);
    }
  }
  async deleteDatabaseColumn(req, res) {
    try {
      const { column, tableName } = req.params;
      if (!column) {
        return res.sendStatus(400);
      }
      const query = `ALTER TABLE "${tableName}" DROP COLUMN "${column}"`;
      await pool.query(query);
      return res.sendStatus(200);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  async addDatabaseColumn(req, res) {
    try {
      const { column_name, column_type, tableName } = req.body;
      const query = `ALTER TABLE "${tableName}" ADD "${column_name}" ${column_type}`;
      await pool.query(query);
      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.status(400).send(error);
    }
  }
  async updateUser(req, res) {
    try {
      const { key, newValue, access_level } = req.body;

      if (
        !key ||
        key === "id" ||
        key === "username" ||
        key === "password_hash"
      ) {
        return res.status(400).send("Это поле изменять нельзя");
      }

      const userName = decodeJWT(req.cookies.refreshToken).login;

      if (key === "email") {
        const userID = await getID(userName);
        const query = "UPDATE users SET email = $1 WHERE id = $2";
        await pool.query(query, [newValue, userID]);
      } else {
        let tableName = "";
        switch (parseInt(access_level)) {
          case 0:
            tableName = "user_details";
            break;
          case 1:
            tableName = "worker_details";
            break;
          case 2:
            tableName = "cgs_details";
            break;
          case 3:
            tableName = "gef_details";
            break;
          default:
            return res.status(400).send("Некорректный уровень доступа");
        }
        const query = `UPDATE ${tableName} SET ${key} = $1 WHERE username = $2`; // ТУТ МОЖЕТ БЫТЬ SQL Инъекция
        await pool.query(query, [newValue, userName]);
      }

      return res.sendStatus(200);
    } catch (error) {
      console.error("Ошибка при обновлении пользователя:", error);
      return res.status(400).send(error);
    }
  }

  async setAccessLevel(req, res) {
    try {
      const { username, access_level } = req.body;
      const query = "UPDATE users SET access_level = $1 WHERE username = $2";
      await pool.query(query, [access_level, username]);
      return res.send("OK");
    } catch (error) {
      return res.status(400).send({ error: error });
    }
  }
  async getAllUsers(req, res) {
    try {
      const query = "select username from users";
      const result = await pool.query(query);
      if (result.rowCount > 0) {
        return res.send(result.rows);
      } else {
        return res
          .status(400)
          .send({ error: "Проблема с получнием пользователей" });
      }
    } catch (error) {
      return res.status(400).send({ error: error });
    }
  }
  async createSystem(req, res) {
    try {
      const { system_name } = req.body;

      const existingSystem = await pool.query(
        "SELECT * FROM systems WHERE name = $1",
        [system_name]
      );

      if (existingSystem.rowCount > 0) {
        return res.status(400).send({ error: "Такая система уже существует" });
      }

      const result = await pool.query("INSERT INTO systems (name) values($1)", [
        system_name,
      ]);

      const user_id = await getID(decodeJWT(req.cookies.refreshToken).login);
      const insertResult = await pool.query(
        "INSERT INTO user_systems (user_id, name) VALUES ($1, $2)",
        [user_id, system_name]
      );

      if (result.rowCount > 0 && insertResult.rowCount > 0) {
        return res.send("OK");
      } else {
        return res.sendStatus(400);
      }
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error: error.message });
    }
  }
  async getRequestColumns(req, res) {
    try {
      const result = await pool.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_requests_info'; "
      );
      if (result.rowCount > 0) {
        return res.send(result.rows);
      } else {
        return res.sendStatus(400);
      }
    } catch (error) {
      return res.send({ message: error });
    }
  }
  async getWattsonEmployee(req, res) {
    try {
      const result_wattson = await pool.query("SELECT * FROM cgs_details");
      const result_worker = await pool.query("SELECT * FROM worker_details");
      if (result_wattson.rowCount > 0 && result_worker.rowCount > 0) {
        return res.send({
          wattson: result_wattson.rows,
          worker: result_worker.rows,
        });
      } else {
        return res.sendStatus(400);
      }
    } catch (error) {
      return res.send({ message: error }); // добавить АСЦ работинков
    }
  }
  async getColumnsData(req, res) {
    try {
      const result_workers = await pool.query(`SELECT * FROM worker_details;`);
      const result_users = await pool.query(`SELECT * FROM user_details;`);
      const result_cgs = await pool.query(`SELECT * FROM cgs_details;`);
      const result_gef = await pool.query(`SELECT * FROM gef_details;`);
      const result_requests = await pool.query(
        `SELECT * FROM user_requests_info;`
      );
      const result_materials = await pool.query(
        `SELECT * FROM materials_stage`
      );
      const result_in_transit_stage = await pool.query(
        `SELECT * FROM in_transit_stage`
      );
      const result_work_in_progress_stage = await pool.query(
        `SELECT * FROM work_in_progress_stage`
      );
      if (
        result_workers.rowCount > 0 &&
        result_users.rowCount > 0 &&
        result_cgs.rowCount > 0 &&
        result_gef.rowCount > 0 &&
        result_requests.rowCount > 0
      ) {
        return res.send({
          worker_details: result_workers.rows,
          user_details: result_users.rows,
          cgs_details: result_cgs.rows,
          gef_details: result_gef.rows,
          user_requests_info: result_requests.rows,
          materials_stage: result_materials.rows,
          in_transit_stage: result_in_transit_stage.rows,
          work_in_progress_stage: result_work_in_progress_stage.rows,
        });
      }
      return res.sendStatus(400);
    } catch (error) {
      res.status(400).send(error);
    }
  }
  async getFullRequest(req, res) {
    try {
      const { id } = req.params;
      const response = await pool.query(
        `SELECT
          ur.*, 
          u.username AS worker_username,
          u.phone_number AS worker_phone,
          w.username AS wattson_username,
          w.phone_number AS wattson_phone,
          rc.user_confirmed,
          rc.worker_confirmed,
          rc.regional_confirmed,
          rc.service_engineer_confirmed,
          rc.action,
          uri.worker_confirmed AS uri_worker_confirmed
        FROM user_requests ur
        LEFT JOIN users u ON ur.assigned_to = u.id
        LEFT JOIN users w ON ur.region_assigned_to = w.id
        LEFT JOIN request_confirmations rc ON ur.id = rc.request_id
        LEFT JOIN user_requests_info uri ON ur.id = uri.request_id
        WHERE ur.id = $1;`,
        [id]
      );

      if (response.rows.length === 0) {
        return res.status(404).json({ message: "Запрос не найден" });
      }

      return res.json(response.rows[0]);
    } catch (error) {
      console.error("Ошибка при получении запроса:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  async workersNameList(req, res) {
    try {
      const result_worker = await pool.query(
        "SELECT id, username, access_level FROM users WHERE access_level = 1"
      );
      const result_wattson = await pool.query(
        "SELECT id, username, access_level FROM users WHERE access_level = 2"
      );
      if (result_worker.rowCount > 0 || result_wattson.rowCount > 0) {
        return res.send({
          worker_name: result_worker.rows,
          wattson_name: result_wattson.rows,
        });
      }
      return res.status(400).send({ message: "Ошибка поиска сотрудников" });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  }
  async setNewWorker(req, res) {
    try {
      const { username, access_level, requestID, id: userId } = req.body;

      const requestQuery = await pool.query(
        `SELECT ur.assigned_to, ur.region_assigned_to, ur.system_name 
         FROM user_requests ur 
         JOIN user_requests_info uri ON ur.id = uri.request_id 
         WHERE ur.id = $1`,
        [requestID]
      );

      if (requestQuery.rowCount === 0) {
        return res.status(404).json({ message: "Заявка не найдена." });
      }
      const { assigned_to, region_assigned_to, system_name } =
        requestQuery.rows[0];

      let updateField;
      let oldUserId = null;

      if (username === "Нет") {
        if (access_level === 0) {
          updateField = "assigned_to";
          oldUserId = assigned_to;
        } else if (access_level === 1) {
          updateField = "region_assigned_to";
          oldUserId = region_assigned_to;
        } else {
          return res.status(400).json({ message: "Неверный уровень доступа." });
        }
      } else {
        updateField = access_level === 1 ? "assigned_to" : "region_assigned_to";
        oldUserId = requestQuery.rows[0][updateField];
      }

      if (username === "Нет") {
        if (access_level === 0) {
          await pool.query(
            `UPDATE user_requests SET assigned_to = NULL WHERE id = $1`,
            [requestID]
          );
          await pool.query(
            `UPDATE user_requests_info SET worker_confirmed = FALSE WHERE request_id = $1`,
            [requestID]
          );
        } else if (access_level === 1) {
          await pool.query(
            `UPDATE user_requests SET region_assigned_to = NULL WHERE id = $1`,
            [requestID]
          );
          await pool.query(
            `UPDATE user_requests_info SET wattson_confirmed = FALSE WHERE request_id = $1`,
            [requestID]
          );
        }
      } else {
        const result = await pool.query(
          `UPDATE user_requests SET ${updateField} = $1 WHERE id = $2`,
          [userId, requestID]
        );
        if (result.rowCount === 0) {
          return res.status(404).json({ message: "Заявка не найдена." });
        }
      }

      if (oldUserId) {
        const checkQuery = await pool.query(
          `SELECT COUNT(*) 
           FROM user_requests ur
           JOIN user_requests_info uri ON ur.id = uri.request_id
           WHERE ur.${updateField} = $1 AND ur.system_name = $2`,
          [oldUserId, system_name]
        );
        const remainingRequests = parseInt(checkQuery.rows[0].count, 10);
        if (remainingRequests === 0) {
          await pool.query(
            `DELETE FROM user_systems WHERE user_id = $1 AND name = $2`,
            [oldUserId, system_name]
          );
        }
      }
      if (access_level === 1) {
        await pool.query(
          "UPDATE request_confirmations SET worker_confirmed = false where request_id = $1",
          [requestID]
        );
      } else if (access_level === 2) {
        await pool.query(
          "UPDATE request_confirmations SET regional_confirmed = false where request_id = $1",
          [requestID]
        );
      }
      return res.status(200).json({ message: "Заявка успешно обновлена." });
    } catch (error) {
      console.error("Ошибка при обновлении заявки:", error);
      return res.status(500).json({ message: "Внутренняя ошибка сервера." });
    }
  }

  async getTooltipEmployees(req, res) {
    try {
      const result = await pool.query(
        `SELECT id, username, phone_number, access_level
         FROM users
         WHERE access_level IN (1, 2)`
      );

      const nameList = {
        worker_name: result.rows.filter((user) => user.access_level === 1),
        wattson_name: result.rows.filter((user) => user.access_level === 2),
      };

      return res.json(nameList);
    } catch (error) {
      console.error("Ошибка при получении сотрудников для Tooltip:", error);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
  }
  async getRequestColumnsData(req, res) {
    try {
      const { stageName, requestID } = req.params;
      let tableName = "";
      let selectQuery = "";
      let insertQuery = "";
      let insertValues = [];

      if (stageName === "materials") {
        tableName = "materials_stage";
        selectQuery = `SELECT * FROM ${tableName} WHERE request_id = $1`;
        insertQuery = `INSERT INTO ${tableName} (request_id, details) VALUES ($1, '') RETURNING *`;
        insertValues = [requestID];
      } else if (stageName === "in_transit") {
        tableName = "in_transit_stage";
        selectQuery = `SELECT * FROM ${tableName} WHERE request_id = $1`;
        insertQuery = `INSERT INTO ${tableName} (request_id, estimated_arrival, status) VALUES ($1, NULL, '') RETURNING *`;
        insertValues = [requestID];
      } else if (stageName === "work_in_progress") {
        tableName = "work_in_progress_stage";
        selectQuery = `SELECT * FROM ${tableName} WHERE request_id = $1`;
        insertQuery = `INSERT INTO ${tableName} (request_id, work_description, started_at, completed_at) VALUES ($1, '', current_timestamp, NULL) RETURNING *`;
        insertValues = [requestID];
      } else {
        return res.status(400).json({ error: "Invalid stage name" });
      }

      const result = await pool.query(selectQuery, [requestID]);
      if (result.rowCount === 0) {
        const insertResult = await pool.query(insertQuery, insertValues);
        return res.json(insertResult.rows[0]);
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error in getRequestColumnsData:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async updateRequestColumn(req, res) {
    try {
      const { stageName, key, newValue, id } = req.body;
      let tableName = "";

      if (stageName === "materials") {
        tableName = "materials_stage";
      } else if (stageName === "in_transit") {
        tableName = "in_transit_stage";
      } else if (stageName === "work_in_progress") {
        tableName = "work_in_progress_stage";
      } else {
        return res.status(400).json({ error: "Invalid stage name" });
      }

      const query = `UPDATE ${tableName} SET ${key} = $1 WHERE id = $2`;
      await pool.query(query, [newValue, id]);
      res.json({ message: "Updated successfully" });
    } catch (error) {
      console.error("Error in updateRequestColumn:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getFreeName(req, res) {
    const MAX_ATTEMPTS = 15;

    try {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const timestamp = Date.now();
        const now = new Date(timestamp);

        const formattedDate = [
          String(now.getMonth() + 1).padStart(2, "0"),
          String(now.getDate()).padStart(2, "0"),
        ].join("-");

        const formattedTime = [
          String(now.getHours()).padStart(2, "0"),
          String(now.getMinutes()).padStart(2, "0"),
          String(now.getSeconds()).padStart(2, "0"),
          String(now.getMilliseconds()).padStart(3, "0"),
        ].join("-");

        const freeName = `${formattedDate}_${formattedTime}_${Math.random()
          .toString(36)
          .slice(2, 3)}`;

        const result = await pool.query(
          "SELECT COUNT(*) as count FROM systems WHERE name = $1",
          [freeName]
        );

        if (Number(result.rows[0].count) === 0) {
          return res.json({ freeName });
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      throw new Error("Не удалось сгенерировать уникальное имя");
    } catch (error) {
      console.error("Ошибка генерации свободного имени:", error);
      return res.status(500).json({
        message: error.message || "Ошибка сервера",
        error: error.message,
      });
    }
  }
  async getUserAccessLevel(req, res) {
    try {
      const user_id = decodeJWT(req.cookies.refreshToken).login;
      const response = await pool.query(
        "SELECT access_level FROM users WHERE username = $1",
        [user_id]
      );
      if (response.rowCount > 0) {
        return res.send({ accesslevel: response.rows[0].access_level });
      } else {
        return res.sendStatus(500);
      }
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  }
}
async function updateToken(login, refreshToken, UUID4) {
  try {
    const getUserQuery = `SELECT id FROM users WHERE username = $1`;
    const userResult = await pool.query(getUserQuery, [login]);

    if (userResult.rows.length === 0) {
      console.error("User not found");
      return;
    }

    const userID = userResult.rows[0].id;

    const updateTokenQuery = `
            INSERT INTO refreshtokens (user_id, refreshtoken, uuid)
            VALUES ($1, $2, $3)
            ON CONFLICT (uuid) DO UPDATE
            SET refreshtoken = EXCLUDED.refreshtoken;
        `;
    await pool.query(updateTokenQuery, [userID, refreshToken, UUID4]);

    //console.log('Token updated successfully');
  } catch (err) {
    console.error("Error updating token:", err);
  }
}

const checkTokenExists = async (refreshToken) => {
  try {
    const result = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM refreshtokens WHERE refreshtoken = $1)",
      [refreshToken]
    );
    return result.rows[0].exists; // true или false (проверка есть ли запись)
  } catch (error) {
    console.error("Ошибка при проверке токена:", error);
    return false;
  }
};

async function deleteCookieDB(refreshToken, UUID4) {
  try {
    const userResult = await pool.query(
      "DELETE FROM refreshtokens WHERE uuid = $1",
      [UUID4]
    );
    return userResult;
  } catch (error) {
    console.log(error);
  }
}

async function log_history(data) {
  try {
    //console.log(data);
    await pool.query(
      "INSERT INTO actions_control (user_id, subject_id, action, time) VALUES ($1, $2, $3, $4)",
      [data.user_id, data.subject_id, data.action, data.time]
    );
  } catch (error) {
    console.log("Проблема логирований действий (log_history)");
    console.log(error);
  }
}

async function getID(login) {
  try {
    const result = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [login]
    );
    if (result.rowCount > 0) {
      return result.rows[0].id;
    } else {
      const error = new Error();
      error.code = 23502;
      throw error;
    }
  } catch (error) {
    if (error.code == "23502") {
      return { code: "23502" };
    }
  }
}

function decodeJWT(token) {
  try {
    const [, payloadB64] = token.split(".");
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64").toString("utf-8")
    );
    return payload;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  DataController: new DataController(),
  checkTokenExists,
};
