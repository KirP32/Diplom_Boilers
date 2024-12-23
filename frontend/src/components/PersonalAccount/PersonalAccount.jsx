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

export default function PersonalAccount() {
  const [devicesArray, setdevicesArray] = useState([]);
  const [deviceFindName, setdeviceFindName] = useState("");
  const [deviceObject, setDeviceObject] = useState();
  const [settingsDialog, setSettingsDialog] = useState(false);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("sensors");

  console.log("PersonalAccount render");

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
    viewRequests: <ViewRequests />,
    createRequests: <CreateRequests deviceObject={deviceObject} />,
  };

  let flag_error = false;

  const getAllDevices = useCallback(async () => {
    try {
      const response = await $api.get("/getSystems");
      if (response.status === 200) {
        const devices = formatResponseData(response.data);
        setdevicesArray(devices);
        if (!deviceObject) {
          setDeviceObject(devices[0]);
        }
      } else if (response.status === 401) {
        console.log("Unauthorized");
      }
    } catch (error) {
      if (
        ((error.response && error.response.status === 401) || // 401 - не авторизован
          error.response.status === 400) &&
        !flag_error // 400 - нет refreshToken в БД
      ) {
        alert("Ваш сеанс истёк, пожалуйста, войдите снова");
        logout(navigate);
        flag_error = true;
      } else {
        console.error(error);
      }
    }
  }, []);

  useEffect(() => {
    getAllDevices();

    const intervalId = setInterval(() => {
      getAllDevices();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [getAllDevices]);

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
      {devicesArray.length > 0 && (
        <div className={styles.lk__wrapper__main__content}>
          <div className={styles.lk__wrapper__main__content__wrapper}>
            <Indicators setSelectedTab={setSelectedTab} tab={selectedTab} />
            {tabObject[selectedTab]}
          </div>
        </div>
      )}
      {devicesArray.length == 0 && (
        <>
          <div className={`${styles.noContent}`}>
            <section className={styles.noContent__section}>
              <h3>Загружаем ваши данные, пожалуйста, подождите</h3>
              <CircularProgress disableShrink />
            </section>
          </div>
        </>
      )}
      <SettingsDialog
        open={settingsDialog}
        setSettingsDialog={(e) => setSettingsDialog(e)}
      ></SettingsDialog>
    </div>
  );
}
