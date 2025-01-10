import { useCallback, useState, useEffect, useContext } from "react";
import styles from "./PersonalAccount.module.scss";
import Input from "../Input/Input";
import Button from "../Button/Button";
import $api from "../../http";
import { useNavigate } from "react-router-dom";
import logout from "../Logout/logout";
import formatResponseData from "./Functions/formatResponseData";
import SettingsDialog from "./Dialogs/SettingsDialog/SettingsDialog";
import { ThemeContext } from "../../Theme";
import Indicators from "./Indicators/Indicators";
import Mnemoscheme from "./tabs/Mnemoscheme/Mnemoscheme";
import NewSensors from "./tabs/NewSensors/NewSensors";
import ViewRequests from "./tabs/ViewRequests/ViewRequests";
import CircularProgress from "@mui/material/CircularProgress";
import CreateRequests from "./tabs/CreateSomeRequest/CreateRequests";
import WorkerRequests from "./WorkerRequests/WorkerRequests";

export default function PersonalAccount() {
  const [deviceFindName, setdeviceFindName] = useState("");
  const { devicesArray, deviceObject, setDeviceObject } =
    useContext(ThemeContext);

  const [settingsDialog, setSettingsDialog] = useState(false);
  const { theme } = useContext(ThemeContext);
  const [selectedTab, setSelectedTab] = useState("sensors");
  const { access_level } = useContext(ThemeContext);
  const [seeWorkerRequests, setSeeWorkerRequests] = useState(true);
  let systems_names = devicesArray.map((item) => item.name);
  const tabObject = {
    sensors: (
      // <Sensors
      //   deviceObject={deviceObject}
      //   setdevicesArray={setdevicesArray}
      //   devicesArray={devicesArray}
      // />
      <NewSensors deviceObject={deviceObject} />
    ),
    mnemoscheme: <Mnemoscheme />,
    viewRequests: <ViewRequests deviceObject={deviceObject} />,
    createRequests: <CreateRequests deviceObject={deviceObject} />,
  };

  return (
    <div className={`${styles.lk__wrapper} ${theme}`}>
      <div className={styles.lk__wrapper__sidebar}>
        <div className={styles.lk__wrapper__sidebar__header}>
          <h4>Мои инженерные системы</h4>
          <Input
            placeholder="Поиск систем"
            value={deviceFindName}
            onChange={(event) => setdeviceFindName(event.target.value)}
          />
          <hr />
        </div>
        <div className={styles.lk__wrapper__sidebar__devices}>
          {devicesArray && (
            <>
              {devicesArray
                .filter((item) =>
                  item?.name
                    .toLowerCase()
                    .includes(deviceFindName.toLowerCase())
                )
                .map((item) => (
                  <div
                    key={item.name}
                    className={`${styles.devices_container} ${
                      item.name === deviceObject.name
                        ? styles.container_active
                        : ""
                    }`}
                    onClick={() => {
                      setDeviceObject(item);
                      setSeeWorkerRequests(false);
                    }}
                  >
                    <div
                      className={`${styles[`circle__` + `${item.status}`]} ${
                        styles.circle
                      } ${styles.no_select}`}
                    />
                    <h4 className={styles.device__text}>{item.name}</h4>
                  </div>
                ))}
            </>
          )}
        </div>

        <div className={styles.lk__wrapper__sidebar__options}>
          {access_level === 1 && (
            <Button
              className={styles.requests}
              onClick={() => setSeeWorkerRequests(!seeWorkerRequests)}
            >
              <h4>Заявки</h4>
            </Button>
          )}
          <Button className={styles.lk__wrapper__sidebar__options__btn_delete}>
            <h4>Удаление</h4>
          </Button>
          <Button
            className={styles.lk__wrapper__sidebar__options__btn_settings}
            onClick={() => setSettingsDialog(!settingsDialog)}
          >
            <h4>Настройки</h4>
          </Button>
        </div>
      </div>
      <div className={styles.lk__wrapper__main__content}>
        <div className={styles.lk__wrapper__main__content__wrapper}>
          {devicesArray.length > 0 &&
            (seeWorkerRequests === false || access_level === 0) && (
              <>
                <Indicators setSelectedTab={setSelectedTab} tab={selectedTab} />
                {tabObject[selectedTab]}
              </>
            )}
          {devicesArray.length == 0 &&
            (seeWorkerRequests === false || access_level === 0) && (
              <>
                <div className={`${styles.noContent}`}>
                  <section className={styles.noContent__section}>
                    <h3>Ищем ваши системы, пожалуйста, подождите</h3>
                    <CircularProgress disableShrink />
                  </section>
                </div>
              </>
            )}
          {access_level === 1 && seeWorkerRequests && (
            <WorkerRequests systems_names={systems_names} />
          )}
        </div>
      </div>

      <SettingsDialog
        open={settingsDialog}
        setSettingsDialog={(e) => setSettingsDialog(e)}
      ></SettingsDialog>
    </div>
  );
}
