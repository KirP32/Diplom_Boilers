import React, { useContext, useEffect, useState } from "react";
import styles from "./RequestDetails.module.scss";
import { ThemeContext } from "../../../../../Theme";
import A_SearchWorker from "./additionalComponents/Admin/A_SearchWorker/A_SearchWorker";
import U_SearchWorker from "./additionalComponents/User/U_SearchWorker/U_SearchWorker";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import U_Materials from "./additionalComponents/User/U_Materials/U_Materials";
import A_Materials from "./additionalComponents/Admin/A_Materials/A_Materials";
import Button from "@mui/material/Button";
//import $api from "../../../../../http";
import { socket } from "../../../../../socket";
import { jwtDecode } from "jwt-decode";

const data_type_1 = [
  "Поиск специалиста",
  "Материалы",
  "В пути",
  "Проводятся работы",
  "Завершенно",
];

export default function RequestDetails({ item, setItem }) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  useEffect(() => {
    const requestId = item.id;
    socket.connect();
    socket.emit("joinRequest", requestId, (response) => {
      if (response.status === "error") {
        console.error("Не удалось подключиться к комнате");
      }
    });

    const handleRequestUpdate = (data) => {
      console.log("Новый объект", data);
    };

    const handleUserJoined = (data) => {
      console.log("Пользователь подключился");
      console.log(data);
    };

    socket.on("requestData", handleRequestUpdate);
    socket.on("requestUpdated", handleRequestUpdate);
    socket.on("userJoined", handleUserJoined);

    return () => {
      socket.emit("leaveRequest", requestId);
      socket.off("requestData", handleRequestUpdate);
      socket.off("requestUpdated", handleRequestUpdate);
      socket.off("userJoined", handleUserJoined);
      socket.disconnect();
    };
  }, []);

  async function sendMessage() {
    console.log("send message");
    const name = jwtDecode(
      localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken")
    ).login;
    try {
      const response = await socket.emitWithAck("nextStage", {
        login: name,
        system_name: item.system_name,
        id: item.id,
        stage: item.stage,
        access_level: access_level,
      });
      console.log(response.status);
    } catch (error) {
      console.log(error);
    }
  }
  const react_functional_components = {
    "Поиск специалиста": [<U_SearchWorker item={item} />, <A_SearchWorker />],
    Материалы: [<U_Materials />, <A_Materials />],
    "В пути": <></>,
    "Проводятся работы": <></>,
    Завершенно: <></>,
  };
  const closePanel = () => {
    socket.disconnect();
    setItem(null);
  };

  const handleStep = (step) => () => {
    setItemStage(step);
  };

  const { access_level } = useContext(ThemeContext);

  const [itemStage, setItemStage] = useState(item.stage);
  return (
    <div className={styles.backdrop} onClick={closePanel}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div
          className={styles.span__wrapper}
          style={{
            position: "absolute",
            marginLeft: "-75px",
            width: "55px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            marginTop: "-20px",
            borderRadius: "9px 0px 0px 9px",
            backgroundColor: "white",
          }}
        >
          <span
            className={`material-icons no_select`}
            style={{
              color: "red",
              fontSize: 55,
              cursor: "pointer",
            }}
            onClick={(e) => {
              closePanel();
              e.stopPropagation();
            }}
          >
            cancel
          </span>
        </div>

        <h3 style={{ textAlign: "center", marginBottom: 15 }}>
          {item.problem_name}
        </h3>
        <Stepper
          nonLinear
          activeStep={itemStage}
          sx={{
            "& .MuiStepLabel-iconContainer .Mui-active": {
              animation: "pulse 2s infinite",
              color: "green",
            },
            "@keyframes pulse": {
              "0%": {
                transform: "scale(1)",
              },
              "50%": {
                transform: "scale(1.2)",
              },
              "100%": {
                transform: "scale(1)",
              },
            },
          }}
        >
          {data_type_1.map((label, index) => (
            <Step key={index}>
              <StepButton color="inherit" onClick={handleStep(index)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
        {react_functional_components[data_type_1[itemStage]][access_level]}
        <Button onClick={() => socket.connect()}>Подключить</Button>
        <Button onClick={() => socket.disconnect()}>Отключить</Button>
        {isConnected && (
          <>
            <h3>Подключен</h3>
          </>
        )}
        <section className={styles.request_buttons}>
          <Button variant="contained">Назад {}</Button>
          <Button
            variant="contained"
            color={
              item.user_confirmed || item.worker_confirmed
                ? "success"
                : "primary"
            }
            onClick={sendMessage}
          >
            {item.user_confirmed && item.worker_confirmed
              ? "✅ Подтверждено"
              : item.user_confirmed || item.worker_confirmed
              ? "Вперёд 1/2"
              : "Вперёд"}
          </Button>

          {/* // Добавить авто смену цвета когда кто-то жмёт вперёд или назад + Когда один нажал, у другого тоже должно поменяться */}
        </section>
      </div>
    </div>
  );
}
