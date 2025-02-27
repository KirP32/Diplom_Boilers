/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from "react";
import styles from "./CreateRequests.module.scss";
import PhoneInput from "../../additionalComponents/PhoneInput/PhoneInput";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Box } from "@mui/material";
import Button from "../../../Button/Button";
import { jwtDecode } from "jwt-decode";
import $api from "../../../../http";
import { ThemeContext } from "../../../../Theme";

export default function CreateRequests({ deviceObject, setSelectedTab }) {
  const [phone, setPhone] = useState("");
  const [problem, setProblem] = useState("");
  const [object, setObject] = useState({ s_number: "Другое", type: 0 });
  const deviceObjectTemp = [
    ...deviceObject.boilers,
    { s_number: "Другое", type: 0 },
    { s_number: "Котёл МВ 3", type: 0 },
    { s_number: "Котёл МВ 4", type: 0 },
  ];
  const { access_level } = useContext(ThemeContext);

  const [errors, setErrors] = useState({
    problem: false,
    phone: false,
    worker: false,
  });

  const [description, setDescription] = useState("");
  const [successFlag, setSuccessFlag] = useState(false);

  function validate() {
    const problemError = problem.length < 1;
    const phoneError = phone.length !== 12;
    setErrors({
      problem: problemError,
      phone: phoneError,
      //worker: wattsonWorker == "",
    });

    return !(problemError || phoneError);
  }

  const [dataColumn, setdataColumn] = useState([]);

  const [dataEmployees, setDataEmployees] = useState(null);
  const [wattsonWorker, setWattsonWorker] = useState("");
  const [ascWorker, setAscWorker] = useState("");

  function clearForm() {
    setPhone("");
    setProblem("");
    setObject({ s_number: "Другое", type: 0 });
    setDescription("");
  }

  function handleCreateRequest() {
    if (validate()) {
      const data = {
        problem_name: problem,
        module: object.s_number,
        created_by: jwtDecode(
          localStorage.getItem("accessToken") ||
            sessionStorage.getItem("accessToken")
        ).login,
        description: description,
        system_name: deviceObject.name,
        phone: phone,
        type: object.type,
        created_by_worker: !(access_level === 0),
        access_level: access_level,
        additional_data: columnInputs, // не используется на сервере
        assigned_to_wattson: wattsonWorker === "" ? null : wattsonWorker,
        assigned_to_worker: ascWorker === "" ? null : ascWorker,
      };

      $api.post("/createRequest", data).then((result) => {
        setSuccessFlag(true);
        setTimeout(() => setSuccessFlag(false), 5000);
        clearForm();
      });
    }
  }

  useEffect(() => {
    $api
      .get("/getRequestColumns")
      .then((result) => {
        setdataColumn(result.data);
      })
      .catch((error) => {
        setdataColumn(null);
      });
  }, []);

  useEffect(() => {
    $api
      .get("/getWattsonEmployee")
      .then((result) => {
        setDataEmployees(result.data);
      })
      .catch((error) => {
        setDataEmployees(null);
      });
  }, []);

  const [columnInputs, setColumnInputs] = useState({});

  const handleColumnInputChange = (columnName, value) => {
    setColumnInputs((prev) => ({
      ...prev,
      [columnName]: value,
    }));
  };

  return (
    <Box
      sx={{
        maxHeight: "80vh",
        overflow: "auto",
        padding: "10px",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        color: "var(--text-color)",
      }}
    >
      <h2>Заполните вашу заявку</h2>
      <div className={styles.form_wrapper}>
        <section className={styles.problem_input}>
          <h4>Ваша проблема</h4>
          <input
            type="text"
            autoFocus
            required
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
          />
          {errors.problem && <h5 className={styles.error}>Укажите проблему</h5>}
        </section>
        <section>
          <h4>Проблема с:</h4>
          <FormControl
            variant="standard"
            sx={{
              m: 1,
              color: "white",
              backgroundColor: "white",
              width: "100%",
              margin: 0,
            }}
          >
            <Select
              value={object.s_number}
              onChange={(e) => {
                const selectedObject = deviceObjectTemp.find(
                  (item) => item.s_number === e.target.value
                );
                setObject(selectedObject);
              }}
              sx={{
                fontSize: 17,
              }}
            >
              {deviceObjectTemp.map((item) => (
                <MenuItem
                  key={item.s_number}
                  value={item.s_number}
                  sx={{ fontSize: 17 }}
                >
                  {item.s_number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </section>
        <section>
          {dataColumn &&
            dataColumn
              .filter(
                (item) =>
                  item.column_name !== "id" && item.column_name !== "request_id"
              )
              .map((item) => (
                <div key={item.column_name}>
                  <h4>{item.column_name}</h4>
                  <input
                    type="text"
                    value={columnInputs[item.column_name] || ""}
                    onChange={(e) =>
                      handleColumnInputChange(item.column_name, e.target.value)
                    }
                  />
                </div>
              ))}
        </section>
        <section>
          <h4>Подробности</h4>
          <textarea
            name=""
            id=""
            className={styles.textarea_input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </section>
        <section>
          <h4>Назначить WATTSON</h4>
          <FormControl
            variant="standard"
            sx={{
              m: 1,
              color: "white",
              backgroundColor: "white",
              width: "100%",
              margin: 0,
            }}
          >
            <Select
              value={wattsonWorker}
              onChange={(e) => setWattsonWorker(e.target.value)}
              sx={{ fontSize: 17 }}
            >
              <MenuItem value={""}>Нет</MenuItem>
              {dataEmployees?.wattson &&
                dataEmployees?.wattson.map((employee) => (
                  <MenuItem
                    key={employee.id}
                    value={employee.username}
                    sx={{ fontSize: 17 }}
                  >
                    {employee.username || "Без имени"}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          {/* {errors.worker && (
              <h5 className={styles.error}>Выберите работника</h5>
            )} */}
        </section>
        <section>
          <h4>Назначить АСЦ</h4>
          <FormControl
            variant="standard"
            sx={{
              m: 1,
              color: "white",
              backgroundColor: "white",
              width: "100%",
              margin: 0,
            }}
          >
            <Select
              value={ascWorker}
              onChange={(e) => setAscWorker(e.target.value)}
              sx={{ fontSize: 17 }}
            >
              <MenuItem value={""}>Нет</MenuItem>
              {dataEmployees?.worker &&
                dataEmployees.worker.map((employee) => (
                  <MenuItem
                    key={employee.id}
                    value={employee.username}
                    sx={{ fontSize: 17 }}
                  >
                    {employee.username || "Без имени"}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          {/* {errors.worker && (
              <h5 className={styles.error}>Выберите работника</h5>
            )} */}
        </section>
        <section className={styles.phone_section}>
          <h4>Номер для связи</h4>
          <PhoneInput
            phone={phone}
            onPhoneChange={(newPhone) => {
              setPhone(newPhone);
            }}
            style={{ fontSize: 17 }}
          />
          {errors.phone && <h5 className={styles.error}>Неправильный номер</h5>}
        </section>

        <Button style={{ fontSize: 17 }} onClick={handleCreateRequest}>
          Создать
        </Button>
      </div>
      {successFlag && (
        <>
          <h4 className={styles.success}>
            Завка успешно создана <br /> Проверь её в Заявки - Просмотр
          </h4>
          <Button onClick={setSelectedTab}>Просмотр</Button>
        </>
      )}
    </Box>
  );
}
