import React, { useContext, useEffect, useState } from "react";
import styles from "./RequestDetails.module.scss";
import { ThemeContext } from "../../../../../Theme";
import A_SearchWorker from "./additionalComponents/Admin/A_SearchWorker/A_SearchWorker";
import U_SearchWorker from "./additionalComponents/User/U_SearchWorker/U_SearchWorker";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import U_Materials from "./additionalComponents/User/U_Materials/U_Materials";
import A_Materials from "./additionalComponents/Admin/A_Materials/A_Materials";

const data_type_1 = [
  "Поиск специалиста",
  "Материалы",
  "В пути",
  "Проводятся работы",
  "Завершенно",
];

export default function RequestDetails({ item, setItem }) {
  const react_functional_components = {
    "Поиск специалиста": [<U_SearchWorker item={item} />, <A_SearchWorker />],
    Материалы: [<U_Materials />, <A_Materials />],
    "В пути": <></>,
    "Проводятся работы": <></>,
    Завершенно: <></>,
  };
  const closePanel = () => {
    setItem(null);
  };

  const handleStep = (step) => () => {
    setItemStage(step);
  };

  const { access_level } = useContext(ThemeContext);

  const [itemStage, setItemStage] = useState(item.stage);

  return (
    <div className={styles.backdrop} onClick={closePanel}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ textAlign: "center", marginBottom: 15 }}>
          {item.problem_name}
        </h3>
        <Stepper
          nonLinear
          activeStep={itemStage}
          sx={{
            "& .MuiStepLabel-iconContainer .Mui-active": {
              animation: "pulse 2s infinite",
              color: "green",
            },
            "@keyframes pulse": {
              "0%": {
                transform: "scale(1)",
              },
              "50%": {
                transform: "scale(1.2)",
              },
              "100%": {
                transform: "scale(1)",
              },
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
        {react_functional_components[data_type_1[itemStage]][access_level]}
        {/* <button onClick={closePanel}>Закрыть</button> */}
      </div>
    </div>
  );
}
