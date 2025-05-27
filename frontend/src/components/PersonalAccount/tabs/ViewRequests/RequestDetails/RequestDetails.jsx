/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import styles from "./RequestDetails.module.scss";
import { ThemeContext } from "../../../../../Theme";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Button from "@mui/material/Button";
import region_data from "../../../../WorkerPanel/DataBaseUsers/russian_regions_codes.json";

import {
  Typography,
  Box,
  Tooltip,
  CircularProgress,
  Collapse,
} from "@mui/material";
import $api from "../../../../../http";
import { socket } from "../../../../../socket";
import { IconButton } from "@mui/material";
import SearchWorker from "./additionalComponents/SearchWorker/SearchWorker";
import OnWay from "./additionalComponents/OnWay/OnWay";
import WorkInProgress from "./additionalComponents/WorkInProgress/WorkInProgress";
import Complete from "./additionalComponents/Complete/Complete";
import PhotoFolder from "./additionalComponents/PhotoFolder/PhotoFolder";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { EventSourcePolyfill } from "event-source-polyfill";

const data_type_1 = [
  "Рекламация на оборудование",
  // "Материалы",
  "В пути",
  "Проводятся работы",
  "Завершенно",
];

export default function RequestDetails({
  item, // минимальная информация {assigned_to (это даже не надо), id, problem_name, status, system_name}
  setItem, // чтобы закрыть окно заявки
  getAllDevices, // если завершена, чтобы убрать доступ к системе у работника
}) {
  const [sseEvent, setSseEvent] = useState();
  const [fullItem, setFullItem] = useState(null);
  // const [keyEditing, setKeyEditing] = useState("");
  // const [editingName, setEditingName] = useState("");
  const { access_level } = useContext(ThemeContext);
  const [itemStage, setItemStage] = useState(fullItem?.stage);
  // const [nameList, setNameList] = useState({
  //   worker_name: [],
  //   wattson_name: [],
  // });
  const [socketLoading, setSocketLoading] = useState(true);
  const [lockedAction, setLockedAction] = useState(null);
  const [lastActionUser, setLastActionUser] = useState(null);
  const [requestOpen, setRequsetOpen] = useState(false);
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
  // useEffect(() => {
  //   $api
  //     .get("/workersNameList")
  //     .then((result) => {
  //       setNameList(result.data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // }, []);

  useEffect(() => {
    if (!item.id) return;
    const es = new EventSourcePolyfill(
      `http://localhost:8080/events?requestID=${item.id}`,
      {
        withCredentials: true,
        headers: {
          accesstoken:
            localStorage.getItem("accessToken") ||
            sessionStorage.getItem("accessToken"),
        },
      }
    );
    // Обработчик события для обновления даты начала работ
    es.addEventListener("repairDate_updated", () => {
      setSseEvent({ type: "repairDate_updated" });
    });
    // Обработчик события для обновления списка неисправностей оборудования
    es.addEventListener("equipment_updated", () => {
      setSseEvent({ type: "equipment_updated" });
    });
    // Обработчик события для обновления фотографий
    es.addEventListener("photo_updated", () => {
      setSseEvent({ type: "photo_updated" });
    });
    // Удаление фотографии
    es.addEventListener("deletePhoto", () => {
      setSseEvent({ type: "deletePhoto" });
    });
    // Обновление списка услуг
    es.addEventListener("servicesAndGoods", () => {
      setSseEvent({ type: "servicesAndGoods" });
    });
    // Обновление даты окончания работ
    es.addEventListener("completionDate_updated", () => {
      setSseEvent({ type: "completionDate_updated" });
    });
    return () => {
      es.close();
    };
  }, [item.id]);

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

    function handleConnect() {
      // console.log("Сокет УСПЕШНО ПОДКЛЮЧЕН");

      setSocketLoading(false);
      socket.emit("joinRequest", requestId, (response) => {
        if (response.status === "error") {
          console.error("Не удалось подключиться к комнате");
        }
      });
    }

    const handleRequestUpdate = (data) => {
      addToItem(data);
    };

    // const handleConnectError = (err) => {
    //   console.error("Ошибка подключения:", err.message);
    //   console.error("Описание ошибки:", err.description);
    //   console.error("Контекст ошибки:", err.context);
    // };
    // console.log("Начинаю подключение к сокету");
    socket.connect();
    socket.on("connect", handleConnect);
    socket.on("requestUpdated", handleRequestUpdate);
    // socket.on("connect_error", handleConnectError);

    return () => {
      // console.log("Закрытие подключения");
      socket.emit("leaveRequest", requestId);
      socket.off("connect", handleConnect);
      socket.off("requestUpdated", handleRequestUpdate);
      // socket.off("connect_error", handleConnectError);
    };
  }, []);

  // console.log("Текущее состояние socketLoading:", socketLoading);
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
    socket.emit("leaveRequest", item.id);
    socket.disconnect();
    setFullItem(null);
    setItem(null);
  };

  const confirmations = [
    // ...(!fullItem?.created_by_worker
    //   ? [{ name: "Пользователь", confirmed: fullItem?.user_confirmed }]
    //   : []),
    {
      name: "АСЦ",
      confirmed: fullItem?.worker_confirmed,
      info: fullItem
        ? { username: fullItem.worker_username, phone: fullItem.worker_phone }
        : null,
    },
    // {
    //   name: "WATTSON",
    //   confirmed: fullItem?.regional_confirmed,
    //   info: fullItem
    //     ? { username: fullItem.wattson_username, phone: fullItem.wattson_phone }
    //     : null,
    // },
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

  const react_functional_components = {
    "Рекламация на оборудование": (
      <SearchWorker
        item={{
          worker_username: fullItem?.worker_username,
          uri_worker_confirmed: fullItem?.uri_worker_confirmed,
          equipments: fullItem?.equipments,
        }}
        access_level={access_level}
        fullItem={
          fullItem && {
            id: fullItem.id,
            region_code: fullItem.worker_region,
            repair_completion_date: fullItem.repair_completion_date,
          }
        }
        sseEvent={sseEvent}
        setFullItem={(e) => {
          setFullItem((prev) => ({
            ...prev,
            ...e,
          }));
        }}
      />
    ),
    // Материалы: (
    //   <Materials
    //     requestID={fullItem?.id}
    //     access_level={access_level}
    //     worker_username={fullItem?.worker_username}
    //     worker_region={fullItem?.worker_region}
    //   />
    // ),
    "В пути": <OnWay access_level={access_level} />,
    "Проводятся работы": (
      <WorkInProgress
        requestID={fullItem?.id}
        access_level={access_level}
        worker_username={fullItem?.worker_username}
        worker_region={fullItem?.worker_region}
        sseEvent={sseEvent}
      />
    ),
    Завершенно: (
      // <CompletedWorks access_level={access_level} />
      <Complete
        requestID={fullItem?.id}
        worker_region={fullItem?.worker_region}
      />
    ),
  };

  const component = react_functional_components[stepKey] || null;

  const userConfirmed =
    (access_level === 0 && fullItem?.user_confirmed) ||
    (access_level === 1 && fullItem?.worker_confirmed) ||
    (access_level === 2 && fullItem?.regional_confirmed) ||
    (access_level === 3 && fullItem?.service_engineer_confirmed);

  // const handleKeyDown = (event) => {
  //   if (event.key === "Enter") {
  //     handleSubmit();
  //   }
  // };

  // const handleFieldBlur = () => {
  //   handleSubmit();
  // };

  // const handleSubmit = async () => {
  //   const data = { requestID: fullItem.id, ...editingName };
  //   if (editingName) {
  //     try {
  //       await $api.post("/setNewWorker", data);
  //       // изменить логику, не брать данные с сервера повторно, использовать всё из прошлого запроса
  //       const tooltipResponse = await $api.get("/getTooltipEmployees");

  //       setNameList(tooltipResponse.data);

  //       const updatedFull = await $api.get(`/getFullRequest/${fullItem.id}`);
  //       setFullItem(updatedFull.data);

  //       const updatedEditingName =
  //         (tooltipResponse.data.worker_name || []).find(
  //           (worker) => worker.username === editingName.username
  //         ) ||
  //         (tooltipResponse.data.wattson_name || []).find(
  //           (worker) => worker.username === editingName.username
  //         ) ||
  //         "";

  //       setEditingName(updatedEditingName);
  //       setKeyEditing(null);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   } else {
  //     setKeyEditing(null);
  //   }
  // };

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
                width: "100%",
                mt: 2,
                minHeight: "150px",
                mb: 2,
                p: 1,
                border: "1px solid #ccc",
                borderRadius: "8px",
                maxHeight: "200px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
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
                  {
                    // conf.name === keyEditing ? (
                    //   <Autocomplete
                    //     sx={{ width: 300 }}
                    //     options={
                    //       conf.name === "АСЦ"
                    //         ? [
                    //             { id: null, username: "Нет", access_level: 0 },
                    //             ...nameList.worker_name,
                    //           ]
                    //         : [
                    //             { id: null, username: "Нет", access_level: 1 },
                    //             ...nameList.wattson_name,
                    //           ]
                    //     }
                    //     value={editingName}
                    //     onChange={(_, newValue) => setEditingName(newValue || "")}
                    //     getOptionLabel={(option) => option.username || ""}
                    //     renderInput={(params) => (
                    //       <TextField
                    //         {...params}
                    //         autoFocus
                    //         label="Введите имя пользователя"
                    //         size="small"
                    //         onBlur={handleFieldBlur}
                    //         onKeyDown={handleKeyDown}
                    //       />
                    //     )}
                    //     freeSolo
                    //   />
                    // ) : (
                    <>
                      {access_level === 3 && conf.name !== "GEFFEN" ? (
                        <Tooltip
                          title={
                            conf.info && conf.info.username
                              ? `${conf.info.username} (${
                                  conf.info.phone ?? "Телефон неизвестен"
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

                      {/* {access_level === 3 &&
                        conf.name !== "GEFFEN" &&
                        conf.name !== "Пользователь" && (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingName(conf.info?.username ?? "");
                              setKeyEditing(conf.name);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )} */}
                    </>
                    // )
                  }
                </Box>
              ))}
            </Box>
            {
              <RequestInfo
                formatDate={formatDate}
                fullItem={fullItem}
                requestOpen={requestOpen}
                setRequsetOpen={setRequsetOpen}
              />
            }
            {<PhotoFolder requestID={item.id} sseEvent={sseEvent} />}
            {component}
            {fullItem?.status !== 1 && (
              <section
                className={styles.request_buttons}
                style={{ marginTop: "20px" }}
              >
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

function RequestInfo({ fullItem, formatDate, requestOpen, setRequsetOpen }) {
  return (
    <Box
      sx={{
        display: "inline-block",
        border: "1px solid #ccc",
        borderRadius: 1,
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => setRequsetOpen(!requestOpen)}
      >
        <Typography variant="subtitle1" sx={{ m: 0 }}>
          Дополнительные сведения
        </Typography>
        <IconButton
          aria-label="expand row"
          size="small"
          onClick={() => setRequsetOpen(!requestOpen)}
          sx={{
            p: 0.5,
            borderRadius: 1,
          }}
        >
          {requestOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Box>

      <Collapse in={requestOpen}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <b>Система:</b> {fullItem?.system_name}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <b>Регион:</b>{" "}
          {
            region_data.find((item) => {
              return item.code === Number(fullItem?.region_code);
            })?.name
          }
        </Typography>

        <Typography variant="body1" sx={{ mb: 1 }}>
          <b>Создана:</b> {fullItem ? formatDate(fullItem.created_at) : ""}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <b>Описание:</b> {fullItem?.description}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <b>ФИО:</b> {fullItem?.fio}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <b>Контактный номер:</b> {fullItem?.phone_number}
        </Typography>
        <Typography variant="body1">
          <b>Адрес:</b> {fullItem?.addres}
        </Typography>
      </Collapse>
    </Box>
  );
}
