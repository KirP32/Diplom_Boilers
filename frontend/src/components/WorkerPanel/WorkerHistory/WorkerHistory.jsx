import { useEffect, useState } from "react";
import $api from "../../../http";
import styles from "./WorkerHistory.module.scss";
import { useNavigate } from "react-router-dom";
import logout from "../../Logout/logout";

export default function WorkerHistory() {
  const [actionsArr, setActionsArr] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    getActions();
  }, []);

  async function getActions() {
    await $api
      .post("/getActions")
      .then((result) => {
        setActionsArr(result.data);
      })
      .catch((error) => {
        console.log(error);
        if (
          error.status === 401 &&
          localStorage.getItem("stay_logged") == false
        ) {
          logout(navigate);
        }
      });
  }

  return (
    <div
      className={styles.worker_history__wrapper}
      style={{ overflowY: "auto" }}
    >
      {actionsArr[0] === null ? (
        <div className={styles.worker_history__onError}>
          <h4>Событий нет</h4>
        </div>
      ) : (
        <>
          <div className={styles.worker_history__header}>
            <span className={styles.header__username}>Клиент</span>
            <span className={styles.header__action}>Событие</span>
            <span className={styles.header__time}>Время</span>
          </div>
          <div className={styles.worker_history__list}>
            {actionsArr.length > 0 &&
              actionsArr.map((item, index) => (
                <div
                  key={index}
                  className={`${styles.worker_history__list__item} ${
                    index % 2 === 0 ? styles.even : styles.odd
                  }`}
                >
                  <span className={styles.worker_history__list__item__username}>
                    {item?.username}
                  </span>
                  <span className={styles.worker_history__list__item__action}>
                    {item?.action}
                  </span>
                  <span className={styles.worker_history__list__item__time}>
                    {new Date(item?.time).toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
