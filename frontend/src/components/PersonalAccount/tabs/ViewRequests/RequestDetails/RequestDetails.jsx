/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import styles from "./RequestDetails.module.scss";
import { ThemeContext } from "../../../../../Theme";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Button from "@mui/material/Button";

import {
  Typography,
  Box,
  Autocomplete,
  TextField,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import $api from "../../../../../http";
import { socket } from "../../../../../socket";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DataBaseColums from "./DataBaseColums/DataBaseColums";
import SearchWorker from "./additionalComponents/SearchWorker/SearchWorker";
import Materials from "./additionalComponents/Materials/Materials";

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

  const [keyEditing, setKeyEditing] = useState("");
  const [editingName, setEditingName] = useState("");

  const [nameList, setNameList] = useState({
    worker_name: [],
    wattson_name: [],
  });
  const [socketLoading, setSocketLoading] = useState(true);

  useEffect(() => {
    $api
      .get("/workersNameList")
      .then((result) => {
        setNameList(result.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

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
    if (fullItem?.stage !== undefined) {
      setItemStage(fullItem.stage);
    }
  }, [fullItem]);

  const handleStep = (step) => () => {
    setItemStage(step);
  };

  useEffect(() => {
    const requestId = item.id;

    const handleConnect = () => {
      setSocketLoading(false);
      socket.emit("joinRequest", requestId, (response) => {
        if (response.status === "error") {
          console.error("Не удалось подключиться к комнате");
        }
      });
    };

    const handleRequestUpdate = (data) => {
      addToItem(data);
    };

    const handleConnectError = (err) => {
      console.error("Ошибка подключения:", err.message);
      console.error("Описание ошибки:", err.description);
      console.error("Контекст ошибки:", err.context);
    };

    socket.connect();
    socket.on("connect", handleConnect);
    socket.on("requestUpdated", handleRequestUpdate);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.emit("leaveRequest", requestId);
      socket.off("connect", handleConnect);
      socket.off("requestUpdated", handleRequestUpdate);
      socket.off("connect_error", handleConnectError);
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

  const confirmations = [
    ...(!fullItem?.created_by_worker
      ? [{ name: "Пользователь", confirmed: fullItem?.user_confirmed }]
      : []),
    {
      name: "АСЦ",
      confirmed: fullItem?.worker_confirmed,
      info: fullItem
        ? { username: fullItem.worker_username, phone: fullItem.worker_phone }
        : null,
    },
    {
      name: "WATTSON",
      confirmed: fullItem?.regional_confirmed,
      info: fullItem
        ? { username: fullItem.wattson_username, phone: fullItem.wattson_phone }
        : null,
    },
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

  const stageMapping = {
    Материалы: "materials",
    "В пути": "in_transit",
    "Проводятся работы": "work_in_progress",
  };

  const react_functional_components = {
    "Поиск специалиста": (
      <SearchWorker
        item={{
          worker_username: fullItem?.worker_username,
          uri_worker_confirmed: fullItem?.uri_worker_confirmed,
        }}
        access_level={access_level}
      />
    ),
    Материалы: (
      <Materials
        requestID={fullItem?.id}
        access_level={access_level}
        worker_username={fullItem?.worker_username}
        worker_region={fullItem?.worker_region}
      />
    ),
    "В пути": (
      <DataBaseColums requestID={fullItem?.id} access_level={access_level} />
    ),
    "Проводятся работы": (
      <DataBaseColums requestID={fullItem?.id} access_level={access_level} />
    ),
    Завершенно: (
      // <CompletedWorks access_level={access_level} />
      <>Завершенно</>
    ),
  };

  const component = react_functional_components[stepKey] || null;

  const userConfirmed =
    (access_level === 0 && fullItem?.user_confirmed) ||
    (access_level === 1 && fullItem?.worker_confirmed) ||
    (access_level === 2 && fullItem?.regional_confirmed) ||
    (access_level === 3 && fullItem?.service_engineer_confirmed);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const handleFieldBlur = () => {
    handleSubmit();
  };

  const handleSubmit = async () => {
    const data = { requestID: fullItem.id, ...editingName };
    if (editingName) {
      try {
        await $api.post("/setNewWorker", data);

        const tooltipResponse = await $api.get("/getTooltipEmployees");

        setNameList(tooltipResponse.data);

        const updatedFull = await $api.get(`/getFullRequest/${fullItem.id}`);
        setFullItem(updatedFull.data);

        const updatedEditingName =
          (tooltipResponse.data.worker_name || []).find(
            (worker) => worker.username === editingName.username
          ) ||
          (tooltipResponse.data.wattson_name || []).find(
            (worker) => worker.username === editingName.username
          ) ||
          "";

        setEditingName(updatedEditingName);
        setKeyEditing(null);
      } catch (error) {
        console.log(error);
      }
    } else {
      setKeyEditing(null);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className={styles.backdrop} onClick={closePanel}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {socketLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "50px",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <CircularProgress />
              <h4>
                Получение заявки, пожалуйста, отключите <strong>VPN</strong> при
                долгой загрузке
              </h4>
            </div>
          </div>
        ) : (
          <>
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
                display: "flex",
                flexDirection: "row",
                width: "100%",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: "50%",
                  mt: 2,
                  mb: 2,
                  p: 1,
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  maxHeight: "200px",
                  overflowY: "auto",
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
                    {conf.name === keyEditing ? (
                      <Autocomplete
                        sx={{ width: "300px" }}
                        options={
                          conf.name === "АСЦ"
                            ? [
                                { id: null, username: "Нет", access_level: 0 },
                                ...nameList.worker_name,
                              ]
                            : [
                                { id: null, username: "Нет", access_level: 1 },
                                ...nameList.wattson_name,
                              ]
                        }
                        value={editingName}
                        onChange={(event, newValue) =>
                          setEditingName(newValue || "")
                        }
                        getOptionLabel={(option) => option.username || ""}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            autoFocus
                            label="Введите имя пользователя"
                            size="small"
                            onBlur={() => handleFieldBlur()}
                            onKeyDown={(event) => handleKeyDown(event)}
                          />
                        )}
                        freeSolo
                      />
                    ) : (
                      <>
                        {access_level === 3 && conf.name !== "GEFFEN" ? (
                          <Tooltip
                            title={
                              conf.info && conf.info.username
                                ? `${conf.info.username} (${
                                    conf.info.phone
                                      ? conf.info.phone
                                      : "телефон не известен"
                                  })`
                                : "Нет информации"
                            }
                            arrow
                          >
                            <Typography
                              variant="body2"
                              sx={{ mr: 1, cursor: "default" }}
                            >
                              {conf.name}:
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ mr: 1, cursor: "default" }}
                          >
                            {conf.name}:
                          </Typography>
                        )}
                        <Typography
                          variant="body2"
                          color={conf.confirmed ? "green" : "error"}
                        >
                          {conf.confirmed ? "Подтвержден" : "Не подтвержден"}
                        </Typography>
                        {access_level === 3 &&
                          conf.name !== "GEFFEN" &&
                          conf.name !== "Пользователь" && (
                            <IconButton
                              onClick={() => {
                                setEditingName(null);
                                setKeyEditing(conf.name);
                              }}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                      </>
                    )}
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  width: "50%",
                  mt: 2,
                  mb: 2,
                  p: 1,
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <b>Система:</b> {fullItem?.system_name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <b>Создана:</b>{" "}
                  {fullItem ? formatDate(fullItem.created_at) : ""}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <b>Проблема:</b> {fullItem?.problem_name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <b>Описание:</b> {fullItem?.description}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <b>Проблема с модулем:</b> {fullItem?.module}
                </Typography>
                <Typography variant="body1">
                  <b>Контактный номер:</b> {fullItem?.phone_number}
                </Typography>
              </Box>
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
          </>
        )}
      </div>
    </div>
  );
}
