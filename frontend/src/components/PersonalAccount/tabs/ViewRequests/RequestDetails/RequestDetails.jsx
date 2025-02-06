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
import $api from "../../../../../http";
import { socket } from "../../../../../socket";

const data_type_1 = [
  "Поиск специалиста",
  "Материалы",
  "В пути",
  "Проводятся работы",
  "Завершенно",
];

export default function RequestDetails({ item, setItem, getSystems }) {
  const { access_level } = useContext(ThemeContext);

  const [itemStage, setItemStage] = useState(item.stage); // ДЛЯ ЗАВЕРШЁННЫХ ЗАЯВОК
  const handleStep = (step) => () => {
    setItemStage(step);
  };

  useEffect(() => {
    const requestId = item.id;
    socket.connect();

    socket.emit("joinRequest", requestId, (response) => {
      if (response.status === "error") {
        console.error("Не удалось подключиться к комнате");
      }
    });

    const handleRequestUpdate = (data) => {
      addToItem(data);
    };

    socket.on("requestUpdated", handleRequestUpdate);

    return () => {
      socket.emit("leaveRequest", requestId);
      socket.off("requestUpdated", handleRequestUpdate);
    };
  }, [item.id, setItem]);

  useEffect(() => {
    async function getStatus() {
      try {
        const response = await $api.get("/getRequestButtonsStatus", {
          params: { id: item.id },
        });
        if (response.data) {
          const { user_confirmed, worker_confirmed, action } = response.data;
          setItem((prev) => ({
            ...prev,
            user_confirmed,
            worker_confirmed,
            action,
          }));
        }
      } catch (error) {
        console.error(error);
      }
    }
    getStatus();
  }, []);

  function addToItem(data) {
    if (data.status === 1) {
      setItem((prev) => ({
        ...prev,
        user_confirmed: data.user_confirmed,
        worker_confirmed: data.worker_confirmed,
        stage: data.stage,
        status: 1,
        action: data.action,
      }));
    } else {
      setItem((prev) => ({
        ...prev,
        user_confirmed: data.user_confirmed,
        worker_confirmed: data.worker_confirmed,
        stage: data.stage,
        action: data.action,
      }));
    }
    getSystems();
  }

  async function handleNextStage() {
    try {
      const response = await socket.timeout(5000).emitWithAck("nextStage", {
        id: item.id,
        access_level,
        max_stage: data_type_1.length,
        action: "next",
      });
      if (response) {
        addToItem(response);
      } else {
        console.warn("Ответ от сервера не содержит данных:", response);
      }
    } catch (e) {
      console.error(
        "Ошибка: сервер не ответил вовремя или произошла ошибка.",
        e
      );
    }
  }

  async function handlePrevStage() {
    try {
      const response = await socket.timeout(5000).emitWithAck("nextStage", {
        id: item.id,
        access_level,
        max_stage: data_type_1.length,
        action: "prev",
      });
      if (response) {
        addToItem(response);
      } else {
        console.warn("Ответ от сервера не содержит данных:", response);
      }
    } catch (e) {
      console.error(
        "Ошибка: сервер не ответил вовремя или произошла ошибка.",
        e
      );
    }
  }

  const closePanel = () => {
    socket.disconnect();
    setItem(null);
  };

  const isConfirmed = item.user_confirmed || item.worker_confirmed;
  const isNextAction = item.action === "next";
  const isPrevAction = item.action === "prev";
  const isLastStage = data_type_1.length - 1 === item.stage;

  const react_functional_components = {
    "Поиск специалиста": [<U_SearchWorker item={item} />, <A_SearchWorker />],
    Материалы: [<U_Materials />, <A_Materials />],
    "В пути": <></>,
    "Проводятся работы": <></>,
    Завершенно: <></>,
  };

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
          onClick={(e) => {
            closePanel();
            e.stopPropagation();
          }}
        >
          <span
            className={`material-icons no_select`}
            style={{
              color: "red",
              fontSize: 55,
              cursor: "pointer",
            }}
          >
            cancel
          </span>
        </div>

        <h3 style={{ textAlign: "center", marginBottom: 15 }}>
          {item.problem_name}
        </h3>
        {item.status === 0 ? (
          <Stepper
            activeStep={item.stage}
            sx={{
              "& .MuiStepLabel-iconContainer .Mui-active": {
                animation: "pulse 2s infinite",
                color: "green",
              },
              "@keyframes pulse": {
                "0%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.2)" },
                "100%": { transform: "scale(1)" },
              },
            }}
          >
            {data_type_1.map((label, index) => (
              <Step key={index}>
                <StepButton color="inherit">{label}</StepButton>
              </Step>
            ))}
          </Stepper>
        ) : (
          <Stepper
            nonLinear
            activeStep={itemStage}
            sx={{
              "& .MuiStepLabel-iconContainer .Mui-active": {
                animation: "pulse 2s infinite",
                color: "green",
              },
              "@keyframes pulse": {
                "0%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.2)" },
                "100%": { transform: "scale(1)" },
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
        )}

        {
          react_functional_components[
            data_type_1[item.status === 0 ? item.stage : itemStage]
          ][access_level]
        }

        {item.status !== 1 && (
          <section className={styles.request_buttons}>
            <Button
              variant="contained"
              disabled={item.stage === 0}
              color={isConfirmed && isPrevAction ? "success" : "primary"}
              onClick={handlePrevStage}
            >
              {isPrevAction && isConfirmed ? "Назад 1/2" : "Назад"}
            </Button>

            <Button
              variant="contained"
              color={isConfirmed && isNextAction ? "success" : "primary"}
              onClick={handleNextStage}
            >
              {isLastStage
                ? isConfirmed && isNextAction
                  ? "Завершить 1/2"
                  : "Завершить"
                : isConfirmed && isNextAction
                ? "Вперёд 1/2"
                : "Вперёд"}
            </Button>
          </section>
        )}
      </div>
    </div>
  );
}
