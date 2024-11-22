import styles from "./ObjectWrapper.module.scss";

export default function ObjectWrapper({ deviceObject, openDialog }) {
  return (
    <div className={styles.__wrapper}>
      {deviceObject.boilers && (
        <>
          {deviceObject.boilers.map((item) => (
            <div
              key={item.name}
              className={styles.__container}
              onClick={() => openDialog(item)}
            >
              <div className={styles.__container__header}>
                <h4>{item.name}</h4>
              </div>
              <div className={styles.__container__body}>
                <span>
                  <span className="material-icons-outlined">
                    device_thermostat
                  </span>
                  {String(item.t).includes(".")
                    ? String(item.t).split(".")[1].length >= 2
                      ? `${String(item.t).split(".")[0]}.${String(item.t)
                          .split(".")[1]
                          .slice(0, 2)}`
                      : item.t
                    : item.t}
                </span>
                <h5>Время работы:</h5>
                {item.online}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
