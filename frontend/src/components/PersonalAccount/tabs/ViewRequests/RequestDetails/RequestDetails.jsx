import React, { useContext, useEffect, useState } from "react";
import styles from "./RequestDetails.module.scss";
import { ThemeContext } from "../../../../../Theme";
import A_SearchWorker from "./additionalComponents/Admin/A_SearchWorker/A_SearchWorker";
import U_SearchWorker from "./additionalComponents/User/U_SearchWorker/U_SearchWorker";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";

const data_type_1 = [
  "Поиск специалиста",
  "Материалы",
  "В пути",
  "Проводятся работы",
  "Завершенно",
];

const react_functional_components = {
  "Поиск специалиста": [<U_SearchWorker />, <A_SearchWorker />],
  Материалы: <></>,
  "В пути": <></>,
  "Проводятся работы": <></>,
  Завершенно: <></>,
};

export default function RequestDetails({ item, setItem }) {
  const closePanel = () => {
    setItem(null);
  };

  const [activeStep, setActiveStep] = React.useState(0);

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  const { access_level } = useContext(ThemeContext);

  const [itemStage, setItemStage] = useState(item.stage);

  return (
    <div className={styles.backdrop} onClick={closePanel}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ textAlign: "center", marginBottom: 15 }}>{item.name}</h3>
        {/* <div className={styles.panel__stepper}>
          {item.type === 1 &&
            data_type_1.map((string, index) => {
              return (
                <div
                  key={data_type_1[index]}
                  className={`${styles.panel__stepper__item_holder} ${
                    itemStage - 1 === index ? styles.active_stage : ""
                  }`}
                  onClick={() => {
                    if (access_level === 1) setItemStage(index + 1);
                  }}
                >
                  <h4>{string}</h4>
                </div>
              );
            })}
        </div> */}
        <Stepper nonLinear activeStep={activeStep}>
          {data_type_1.map((label, index) => (
            <Step key={index}>
              <StepButton color="inherit" onClick={handleStep(index)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
        {react_functional_components[data_type_1[itemStage - 1]][access_level]}
        <button onClick={closePanel}>Закрыть</button>
      </div>
    </div>
  );
}
