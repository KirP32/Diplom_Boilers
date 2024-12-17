import React, { useEffect, useState } from "react";
import styles from "./RequestDetails.module.scss";

const data_type_1 = [
  "Поиск специалиста",
  "Материалы",
  "В пути",
  "Проводятся работы",
  "Завершенно",
];

const react_functional_components = {
  "Поиск специалиста": <></>,
  Материалы: <></>,
  "В пути": <></>,
  "Проводятся работы": <></>,
  Завершенно: <></>,
};

export default function RequestDetails({ item, setItem }) {
  const closePanel = () => {
    setItem(null);
  };

  const [activeStage, setActiveStage] = useState("Поиск специалиста");

  const templates = {};

  const [itemStage, setItemStage] = useState(item.stage);

  return (
    <div className={styles.backdrop} onClick={closePanel}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ textAlign: "center", marginBottom: 15 }}>{item.name}</h3>
        <div className={styles.panel__stepper}>
          {item.type === 1 &&
            data_type_1.map((string, index) => {
              return (
                <div
                  key={data_type_1[index]}
                  className={`${styles.panel__stepper__item_holder} ${
                    itemStage - 1 === index ? styles.active_stage : ""
                  }`}
                  onClick={() => setItemStage(index + 1)}
                >
                  <h4>{string}</h4>
                </div>
              );
            })}
        </div>
        {data_type_1[itemStage - 1]}
        <button onClick={closePanel}>Закрыть</button>
      </div>
    </div>
  );
}
