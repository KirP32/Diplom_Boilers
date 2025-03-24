import styles from "./WorkerPanel.module.scss";
import Button from "../Button/Button";
import { useState } from "react";
import SignUp from "./SignUp/SignUp";
import AddDevice from "./AddDevice/AddDevice";
import WorkerHistory from "./WorkerHistory/WorkerHistory";
import DataBaseUsers from "./DataBaseUsers/DataBaseUsers";
import { useNavigate } from "react-router-dom";

function WorkerPanel() {
  const [activeComponent, setActiveComponent] = useState("addUser");

  const renderContent = () => {
    switch (activeComponent) {
      case "addUser":
        return <SignUp></SignUp>;
      case "addDevice":
        return <AddDevice></AddDevice>;
      case "dataBase":
        return <DataBaseUsers />;
      case "history":
        return <WorkerHistory></WorkerHistory>;
      default:
        return null;
    }
  };
  const navigate = useNavigate();
  return (
    <div className={styles.worker_wrapper}>
      <div className={styles.worker_wrapper__sidebar}>
        <Button
          className={styles.worker_wrapper__sidebar__button}
          onClick={() => setActiveComponent("addUser")}
        >
          <h4>Добавить пользователя</h4>
        </Button>
        {/* <Button
          className={styles.worker_wrapper__sidebar__button}
          onClick={() => setActiveComponent("addDevice")}
        >
          <h4>Меню устройств</h4>
        </Button> */}
        <Button
          className={styles.worker_wrapper__sidebar__button}
          onClick={() => setActiveComponent("dataBase")}
        >
          <h4>База данных</h4>
        </Button>
        <Button
          className={styles.worker_wrapper__sidebar__button}
          onClick={() => setActiveComponent("history")}
        >
          <h4>История</h4>
        </Button>
        <Button
          className={styles.worker_wrapper__sidebar__button}
          onClick={() => navigate("/personalAccount")}
          style={{ backgroundColor: "rgb(160, 34, 42)" }}
        >
          <h4>На главную</h4>
        </Button>
      </div>
      <div
        className={styles.worker_wrapper__main}
        style={{ position: "relative", maxWidth: "1500px", minWidth: "200px" }}
      >
        {renderContent()}
      </div>
    </div>
  );
}

export default WorkerPanel;
