require("dotenv").config();
const pool = require("../dataBase/pool");

function decodeJWT(token) {
  try {
    const [, payloadB64] = token.split(".");
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64").toString("utf-8")
    );
    return payload;
  } catch (error) {
    console.error("Ошибка декодирования JWT:", error);
    return null;
  }
}

async function checkAuth(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: "Нет токена" });
    }

    const payload = decodeJWT(token);
    if (!payload || !payload.login) {
      return res.status(401).json({ error: "Некорректный токен" });
    }

    const username = payload.login;

    const userRes = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (!userRes.rows.length) {
      return res.status(401).json({ error: "Пользователь не найден" });
    }

    const userId = userRes.rows[0].id;
    const requestID =
      parseInt(req.params.requestID) || parseInt(req.query.requestID);
    if (Number.isInteger(requestID) === false) {
      return res.status(400).json({ error: "Некорректный requestID" });
    }

    const accessRes = await pool.query(
      `
        SELECT 1 FROM user_requests
        WHERE id = $1 AND (
          created_by = $2 OR
          assigned_to = $2 OR
          region_assigned_to = $2 OR
          gef_assigned_to = $2
        )
        LIMIT 1
      `,
      [requestID, userId]
    );

    if (!accessRes.rowCount) {
      return res.status(403).json({ error: "Нет доступа к заявке" });
    }

    next();
  } catch (err) {
    console.error("Ошибка в checkAuth:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}

module.exports = checkAuth;
