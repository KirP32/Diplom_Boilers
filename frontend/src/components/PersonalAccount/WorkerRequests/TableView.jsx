/* eslint-disable react/prop-types */
import styles from "./WorkerRequests.module.scss";
import InfoIcon from "@mui/icons-material/Info";
import MuiButton from "@mui/material/Button";

export default function TableView({
  availData,
  isProcessing,
  addRequest,
  setAdditionalOpen,
  setDetailsObject,
  setCurrentItem,
  removeRequest,
}) {
  return (
    <>
      <div className={styles.available_requests}>
        <h2 style={{ color: "var(--text-color)", marginTop: "20px" }}>
          Доступные заявки
        </h2>
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
                <section
                  style={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <MuiButton
                      variant="contained"
                      onClick={() => addRequest(item.system_name, item.id)}
                      disabled={isProcessing}
                    >
                      Принять
                    </MuiButton>
                  </div>

                  <InfoIcon
                    onClick={() => {
                      setAdditionalOpen();
                      setCurrentItem(item);
                    }}
                    style={{
                      position: "absolute",
                      right: 0,
                      cursor: "pointer",
                    }}
                  />
                </section>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.available_requests}>
        <h2 style={{ color: "var(--text-color)", marginTop: "20px" }}>
          Заявки в работе
        </h2>
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
              <section
                style={{
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <MuiButton
                    variant="contained"
                    disabled={isProcessing}
                    onClick={() => {
                      setDetailsObject(item);
                    }}
                  >
                    Подробнее
                  </MuiButton>
                </div>

                <span
                  className={`material-icons ${styles.no_select}`}
                  style={{
                    color: "red",
                    cursor: "pointer",
                    position: "absolute",
                    right: 0,
                  }}
                  onClick={() => removeRequest(item)}
                >
                  cancel
                </span>
              </section>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
