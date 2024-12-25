import React, { useEffect, useState } from "react";
import Button from "./../../../Button/Button";
import styles from "./NewSensors.module.scss";
import Additionalinfo from "./Additionalinfo/Additionalinfo";

export default function NewSensors({ deviceObject }) {
  const [dataSystems, setDataSystems] = useState([]);
  const [activeSensor, setActiveSensor] = useState(null);
  console.log("NewSensors render");
  console.log(deviceObject);
  return (
    <div className={styles.sensors_wrapper}>
      <div
        className={`${styles.control_buttons} ${
          activeSensor == null ? `${styles.in_active}` : ""
        }`}
      >
        <Button onClick={() => setActiveSensor(null)}>
          <span className="material-icons">arrow_back</span>
          <h4>Назад</h4>
        </Button>
      </div>
      <div
        className={`${styles.wrapper_container} ${
          activeSensor !== null ? `${styles.in_active}` : ""
        }`}
      >
        <div className={`${styles.grid_container}`}>
          {deviceObject.boilers.map((item, index) => (
            <div
              className={styles.grid_item}
              key={item.s_number}
              onClick={() => {
                setActiveSensor(item);
              }}
            >
              {item.s_number}
            </div>
          ))}
        </div>
      </div>
      {activeSensor && <Additionalinfo activeSensor={activeSensor} />}
    </div>
  );
}
