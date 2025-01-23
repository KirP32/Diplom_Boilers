import React, { useContext, useEffect } from "react";
import $api from "../../../http";
import { useState } from "react";
import styles from "./WorkerRequests.module.scss";
import { jwtDecode } from "jwt-decode";

export default function WorkerRequests({
  systems_names,
  getAllDevices,
  setDeviceFirst,
}) {
  const [availData, setAvailData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  async function getData() {
    await $api.get("/getRequests").then((response) => {
      setAvailData(response.data);
    });
  }
  async function removeRequest(item) {
    await $api
      .delete(`/removeRequest/${item.id}`)
      .then(async (result) => {
        await getData();
        await getAllDevices();
        if (
          !availData?.workerDevices.find(
            (object) =>
              object.system_name === item.system_name &&
              object.problem_name !== item.problem_name
          )
        ) {
          console.log("Удаляю последний");
          setDeviceFirst(item.system_name);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function addRequest(system_name, id) {
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
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    getData();
  }, []);
  return (
    <div className={styles.worker_requests__wrapper}>
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
    </div>
  );
}
