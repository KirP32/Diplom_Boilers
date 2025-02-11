/* eslint-disable react/prop-types */
import { useCallback, useEffect } from "react";
import $api from "../../../http";
import { useState } from "react";
import styles from "./WorkerRequests.module.scss";
import { jwtDecode } from "jwt-decode";
import Button from "../../Button/Button";
import OptionsDialog from "../Dialogs/OptionsDialog/OptionsDialog";

export default function WorkerRequests({
  systems_names,
  getAllDevices,
  setDeviceFirst,
}) {
  const [availData, setAvailData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [add_failure, setAdd_Failure] = useState(false);
  const [user_name, setUser_name] = useState("");
  const [user_email, setUserEmail] = useState(null);
  const [options_flag, setOptions_flag] = useState(false);

  const getData = useCallback(async () => {
    const response = await $api.get("/getRequests");
    setAvailData(response.data);
  }, []);

  const removeRequest = useCallback(
    async (item) => {
      try {
        await $api.delete(`/removeRequest/${item.id}`);
        await getData();
        await getAllDevices();
        if (
          !availData?.workerDevices.find(
            (object) =>
              object.system_name === item.system_name &&
              object.problem_name !== item.problem_name
          )
        ) {
          setDeviceFirst(item.system_name);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [getData, getAllDevices, availData, setDeviceFirst]
  );

  const addRequest = useCallback(
    async (system_name, id) => {
      setIsProcessing(true);
      try {
        await $api.post("/addRequest", {
          systems_names: systems_names,
          system_name: system_name,
          user: jwtDecode(
            sessionStorage.getItem("accessToken") ||
              localStorage.getItem("accessToken")
          ).login,
          request_id: id,
        });
        await getData();
        await getAllDevices();
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setAdd_Failure(true);
        setTimeout(() => setAdd_Failure(false), 5000);
      } finally {
        setIsProcessing(false);
      }
    },
    [systems_names, getData, getAllDevices]
  );

  useEffect(() => {
    getData();
    const intervalId = setInterval(getData, 5000);

    return () => clearInterval(intervalId);
  }, [getData]);

  useEffect(() => {
    const token =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken");
    if (token) {
      setUser_name(jwtDecode(token).login);
    } else {
      console.log(token, "Токен не найден");
    }
  }, []);

  useEffect(() => {
    $api
      .post("/getUser_email")
      .then((result) => {
        setUserEmail(result?.data?.email);
      })
      .catch((error) => {
        setUserEmail("");
        console.log(error);
      });
  }, []);

  return (
    <div className={styles.worker_requests__wrapper}>
      <div className={styles.indicators__wrapper}>
        <Button
          className={styles.indicators__button}
          onClick={() => setOptions_flag(!options_flag)}
        >
          <h4>{user_name}</h4>
        </Button>
      </div>
      <div className={styles.available_requests}>
        <h2>Доступные заявки</h2>
        <div className={styles.available_requests__grid__container}>
          <div className={styles.available_requests__grid}>
            {availData?.allDevices?.map((item) => (
              <div
                key={item.id}
                className={styles.available_requests__grid__item}
              >
                <div className={styles.available_requests__grid__item__header}>
                  <h3>{item.problem_name}</h3>
                  <p>Датчик: {item.module}</p>
                  <h3>Система: {item.system_name}</h3>
                </div>
                <button
                  onClick={() => addRequest(item.system_name, item.id)}
                  disabled={isProcessing}
                >
                  Принять
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.available_requests}>
        <h2>Заявки в работе</h2>
        <div className={styles.available_requests__grid}>
          {availData?.workerDevices?.map((item) => (
            <div
              key={item.id}
              className={styles.available_requests__grid__item}
            >
              <div className={styles.available_requests__grid__item__header}>
                <h3>{item.problem_name}</h3>
                <p>Датчик: {item.module}</p>
                <h3>Система: {item.system_name}</h3>
              </div>
              <div className={styles.span__wrapper}>
                <span
                  className={`material-icons ${styles.no_select}`}
                  onClick={() => removeRequest(item)}
                >
                  cancel
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {add_failure && (
        <div className={styles.added__failed}>
          <h4>Заявка уже взята в работу</h4>
        </div>
      )}
      <OptionsDialog
        open={options_flag}
        user={{ user_name, user_email }}
        setOptions={(e) => setOptions_flag(e)}
      ></OptionsDialog>
    </div>
  );
}
