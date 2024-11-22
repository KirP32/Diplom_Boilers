import styles from "./DeviceInfo.module.scss";

export default function DeviceInfo({ deviceObject }) {
  return (
    <div className={styles.__device_info}>
      <div className={styles.section__wrapper}>
        <section className={styles.__device_info__header}>
          <h4>{deviceObject.name} |</h4>{" "}
          <div
            className={`${styles[`circle__` + `${deviceObject.status}`]} ${
              styles.circle
            } ${styles.no_select}`}
          />
        </section>
        <section className={styles.__device_info__connection}>
          <span
            title="Связь wifi стабильна"
            className={`material-icons-outlined ${styles.no_select}`}
          >
            wifi
          </span>
          <span
            title="Связь GSM стабильна"
            className={`material-icons-outlined ${styles.no_select}`}
          >
            signal_cellular_alt
          </span>
        </section>
      </div>
    </div>
  );
}
