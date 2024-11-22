import { useCallback, useState, useEffect, useContext } from "react";
import styles from "./PersonalAccount.module.scss";
import Input from "../Input/Input";
import Button from "../Button/Button";
import $api from "../../http";
import { useNavigate } from "react-router-dom";
import PopDialog from "./Dialogs/PopDialog/PopDialog";
import logout from "../Logout/logout";
import formatResponseData from "./Functions/formatResponseData";
import SettingsDialog from "./Dialogs/SettingsDialog/SettingsDialog";
import { ThemeContext } from "../../Theme";
import ObjectWrapper from "./ObjectWrapper/ObjectWrapper";
import DeviceInfo from "./DeviceInfo/DeviceInfo";
import Indicators from "./Indicators/Indicators";

export default function PersonalAccount() {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [devicesArray, setdevicesArray] = useState([]);
  const [deviceFindName, setdeviceFindName] = useState("");
  const [deviceObject, setDeviceObject] = useState();
  const [indicator, setIndicator] = useState(true);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("");

  let flag_error = false;

  const openDialog = (item) => {
    setSelectedItem(item);
    setOpen(true);
  };

  const getAllDevices = useCallback(async () => {
    try {
      const response = await $api.get("/test_esp");
      if (response.status === 200) {
        const devices = [formatResponseData(response.data)];
        setdevicesArray(devices);
        if (!deviceObject) {
          setDeviceObject(devices[0]);
        }
      } else if (response.status === 401) {
        console.log("Unauthorized");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status === 401 &&
        localStorage.getItem("stay_logged") === "false" &&
        !flag_error
      ) {
        alert("Ваш сеанс истёк, пожалуйста, войдите снова");
        logout(navigate);
        flag_error = true;
      } else {
        console.error(error);
      }
    }
  }, []);

  const updateInfo = (updatedBoiler) => {
    const updatedDevices = devicesArray.map((device) => {
      if (device.id === deviceObject.id) {
        const updatedBoilers = device.boilers.map((boiler) => {
          if (boiler.name === updatedBoiler.name) {
            return { ...boiler, ...updatedBoiler };
          }
          return boiler;
        });

        return { ...device, boilers: updatedBoilers };
      }
      return device;
    });
    setdevicesArray(updatedDevices);
  };

  useEffect(() => {
    getAllDevices();

    const intervalId = setInterval(() => {
      getAllDevices();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [getAllDevices]);

  function sendEsp() {
    $api
      .get("/test_esp")
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async function turnOffEsp() {
    $api
      .put("/off_esp", {
        indicator: indicator ? "-" : "+",
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
    setIndicator(!indicator);
  }

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
                .filter(
                  (item) =>
                    item.name &&
                    item.name
                      .toLowerCase()
                      .includes(deviceFindName.toLowerCase())
                )
                .map((item) => (
                  <div
                    key={item.name}
                    className={styles.devices_container}
                    onClick={() => setDeviceObject(item)}
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
            <Indicators />
            <DeviceInfo deviceObject={deviceObject} />
            <div className={styles.lk__wrapper__main__object}>
              <div className={styles.test_esp}>
                <Button onClick={sendEsp}>Проверка</Button>
                <Button onClick={turnOffEsp}>
                  {indicator ? "Выключить" : "Включить"}
                </Button>
              </div>
              <ObjectWrapper
                deviceObject={deviceObject}
                openDialog={(item) => openDialog(item)}
              />
            </div>
          </div>
        </div>
      )}
      {selectedItem && (
        <PopDialog
          open={open}
          setDialog={(current) => setOpen(current)}
          selectedItem={selectedItem}
          updatedevices={updateInfo}
        ></PopDialog>
      )}
      {devicesArray.length == 0 && (
        <>
          <div className={`${styles.noContent}`}>
            <h3>Для продолжения работы добавьте устройство</h3>
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
