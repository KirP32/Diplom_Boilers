/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
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
import { Typography, Box } from "@mui/material";
import $api from "../../../../../http";
import { socket } from "../../../../../socket";

const data_type_1 = [
  "Поиск специалиста",
  "Материалы",
  "В пути",
  "Проводятся работы",
  "Завершенно",
];

export default function RequestDetails({
  item, // минимальная информация {assigned_to (это даже не надо), id, problem_name, status, system_name}
  setItem, // чтобы закрыть окно заявки
  getAllDevices, // если завершена, чтобы убрать доступ к системе у работника
}) {
  const [fullItem, setFullItem] = useState(null);
  useEffect(() => {
    async function fetchFullItem() {
      try {
        const response = await $api.get(`/getFullRequest/${item.id}`);
        setFullItem(response.data);
      } catch (error) {
        console.error("Ошибка загрузки полной информации", error);
      }
    }
    if (item?.id) {
      fetchFullItem();
    }
  }, [item.id]);

  const { access_level } = useContext(ThemeContext);
  const [itemStage, setItemStage] = useState(fullItem?.stage);

  useEffect(() => {
    setItemStage(fullItem?.stage);
  }, [fullItem?.stage]);

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

  function addToItem(data) {
    if (data.status === 1) {
      setFullItem((prev) => ({
        ...prev,
        user_confirmed: data.user_confirmed,
        worker_confirmed: data.worker_confirmed,
        regional_confirmed: data.regional_confirmed,
        service_engineer_confirmed: data.service_engineer_confirmed,
        stage: data.stage,
        status: 1,
        action: data.action,
      }));

      if (access_level >= 1) {
        getAllDevices();
      }
    } else {
      setFullItem((prev) => ({
        ...prev,
        user_confirmed: data.user_confirmed,
        worker_confirmed: data.worker_confirmed,
        regional_confirmed: data.regional_confirmed,
        service_engineer_confirmed: data.service_engineer_confirmed,
        stage: data.stage,
        action: data.action,
      }));
    }
  }

  const [lockedAction, setLockedAction] = useState(null);
  const [lastActionUser, setLastActionUser] = useState(null);

  async function handleNextStage() {
    try {
      if (access_level > 0) {
        if (lockedAction === "next" && lastActionUser === access_level) {
          setLockedAction(null);
          setLastActionUser(null);
        } else {
          setLockedAction("next");
          setLastActionUser(access_level);
        }
      }
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
      if (access_level > 0) {
        if (lockedAction === "prev" && lastActionUser === access_level) {
          setLockedAction(null);
          setLastActionUser(null);
        } else {
          setLockedAction("prev");
          setLastActionUser(access_level);
        }
      }
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
    setFullItem(null);
    setItem(null);
  };

  const react_functional_components = {
    "Поиск специалиста": [
      <U_SearchWorker item={fullItem} />,
      <A_SearchWorker />,
      <U_SearchWorker item={fullItem} />,
      <U_SearchWorker item={fullItem} />,
      <U_SearchWorker item={fullItem} />,
    ],
    Материалы: [<U_Materials />, <A_Materials />],
    "В пути": <></>,
    "Проводятся работы": <></>,
    Завершенно: <></>,
  };

  const confirmations = [
    ...(!fullItem?.created_by_worker
      ? [{ name: "Пользователь", confirmed: fullItem?.user_confirmed }]
      : []),
    { name: "АСЦ", confirmed: fullItem?.worker_confirmed },
    { name: "WATTSON", confirmed: fullItem?.regional_confirmed },
    { name: "GEFFEN", confirmed: fullItem?.service_engineer_confirmed },
  ];

  const anyConfirmed = confirmations.some((c) => c.confirmed === true);
  const isPrevAction = fullItem?.action === "prev";
  const isNextAction = fullItem?.action === "next";

  const isBackDisabled =
    fullItem?.stage === 0 || (anyConfirmed && fullItem?.action !== "prev");

  const isForwardDisabled = anyConfirmed && fullItem?.action !== "next";

  const isLastStage = data_type_1.length - 1 === fullItem?.stage;
  const stepKey =
    data_type_1[fullItem?.status === 0 ? fullItem?.stage : itemStage];
  const component =
    react_functional_components[stepKey]?.[access_level] || null;

  const userConfirmed =
    (access_level === 0 && fullItem?.user_confirmed) ||
    (access_level === 1 && fullItem?.worker_confirmed) ||
    (access_level === 2 && fullItem?.regional_confirmed) ||
    (access_level === 3 && fullItem?.service_engineer_confirmed);

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
          {fullItem?.problem_name}
        </h3>

        {fullItem?.status === 0 ? (
          <Stepper
            activeStep={fullItem?.stage}
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

        <Box
          sx={{
            mt: 2,
            mb: 2,
            p: 1,
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Подтверждения:
          </Typography>
          {confirmations.map((conf) => (
            <Box
              key={conf.name}
              sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
            >
              <Typography variant="body2" sx={{ mr: 1 }}>
                {conf.name}:
              </Typography>
              <Typography
                variant="body2"
                color={conf.confirmed ? "green" : "error"}
              >
                {conf.confirmed ? "Подтвержден" : "Не подтвержден"}
              </Typography>
            </Box>
          ))}
        </Box>

        {component}

        {fullItem?.status !== 1 && (
          <section className={styles.request_buttons}>
            <Button
              variant="contained"
              disabled={isBackDisabled}
              color={userConfirmed && isPrevAction ? "success" : "primary"}
              onClick={handlePrevStage}
            >
              {userConfirmed && isPrevAction ? "Назад +" : "Назад"}
            </Button>

            <Button
              variant="contained"
              disabled={isForwardDisabled}
              color={userConfirmed && isNextAction ? "success" : "primary"}
              onClick={handleNextStage}
            >
              {isLastStage
                ? "Завершить"
                : userConfirmed && isNextAction
                ? "Вперёд +"
                : "Вперёд"}
            </Button>
          </section>
        )}
      </div>
    </div>
  );
}
