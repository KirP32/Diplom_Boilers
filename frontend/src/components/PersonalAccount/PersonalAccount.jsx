import { useState, useEffect, useContext, useRef } from "react";
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
import AddSystemsDialog from "./Dialogs/AddSystemsDialog/AddSystemsDialog";
import DeleteSystemDialog from "./Dialogs/DeleteSystemDialog/DeleteSystemDialog";

export default function PersonalAccount() {
  const [deviceFindName, setdeviceFindName] = useState("");
  const [devicesArray, setDevicesArray] = useState([]);
  const [deviceObject, setDeviceObject] = useState(null);
  const navigate = useNavigate();
  const [settingsDialog, setSettingsDialog] = useState(false);
  const { theme } = useContext(ThemeContext);
  const [selectedTab, setSelectedTab] = useState("viewRequests");
  const { access_level } = useContext(ThemeContext);
  const [seeWorkerRequests, setSeeWorkerRequests] = useState(true);
  const [addSystemFlag, setAddSystemFlag] = useState(false);
  const [deleteFlag, setDeleteFlag] = useState(false);
  const [deleteFlagDialog, setDeleteFlagDialog] = useState(false);

  let systems_names = devicesArray.map((item) => item.name);
  const tabObject = {
    sensors: <NewSensors deviceObject={deviceObject} />,
    mnemoscheme: <Mnemoscheme />,
    viewRequests: (
      <ViewRequests
        deviceObject={deviceObject}
        getAllDevices={() => getAllDevices(deviceObjectRef.current)}
      />
    ),
    createRequests: (
      <CreateRequests
        deviceObject={deviceObject}
        setSelectedTab={() => setSelectedTab("viewRequests")}
      />
    ),
  };

  const deviceObjectRef = useRef();
  const flagErrorRef = useRef(false);

  deviceObjectRef.current = deviceObject;

  const getAllDevices = async (currentDeviceObject) => {
    try {
      const response = await $api.get("/getSystems");
      if (response.status === 200) {
        const newDevices = formatResponseData(response.data);
        setDevicesArray(newDevices);
        if (!currentDeviceObject) {
          setDeviceObject(newDevices[0]);
        }
      }
    } catch (error) {
      if (
        (error.response?.status === 401 || error.response?.status === 400) &&
        !flagErrorRef.current
      ) {
        alert("Ваш сеанс истёк, пожалуйста, войдите снова");
        logout(navigate);
        flagErrorRef.current = true;
      }
    }
  };

  useEffect(() => {
    getAllDevices(deviceObjectRef.current);

    const intervalId = setInterval(() => {
      getAllDevices(deviceObjectRef.current);
    }, 60000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                      item.name === deviceObject?.name
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
                    {deleteFlag && (
                      <span
                        className={`material-icons styles.no_select`}
                        style={{ color: "red" }}
                        onClick={(e) => {
                          setDeleteFlagDialog({ flag: true, system: item });
                          e.stopPropagation();
                        }}
                      >
                        close
                      </span>
                    )}
                  </div>
                ))}
            </>
          )}
        </div>

        <div className={styles.lk__wrapper__sidebar__options}>
          {access_level >= 1 && (
            <Button
              className={styles.requests}
              onClick={() => setSeeWorkerRequests(!seeWorkerRequests)}
            >
              <h4>Заявки</h4>
            </Button>
          )}
          {(access_level === 0 || access_level === 3 || access_level === 2) && (
            <>
              <Button onClick={() => setAddSystemFlag(!addSystemFlag)}>
                <h4>Добавить систему</h4>
              </Button>
              <Button
                className={styles.lk__wrapper__sidebar__options__btn_delete}
                onClick={() => setDeleteFlag(!deleteFlag)}
              >
                <h4>Удаление</h4>
              </Button>
            </>
          )}

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
          {(seeWorkerRequests === false || access_level === 0) &&
            devicesArray.length > 0 && (
              <h3
                className={
                  styles.lk__wrapper__main__content__wrapper__system_title
                }
              >
                {deviceObject && deviceObject?.name}
              </h3>
            )}

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
          {access_level >= 1 && seeWorkerRequests && (
            <WorkerRequests
              systems_names={systems_names}
              getAllDevices={() => getAllDevices(deviceObjectRef.current)}
              setDeviceFirst={(name) => {
                const firstDevice = devicesArray.find(
                  (item) => item.name !== name
                );
                if (firstDevice) {
                  setDeviceObject(firstDevice);
                }
              }}
              deviceObject={deviceObject}
              devicesArray={devicesArray}
            />
          )}
        </div>
      </div>

      <SettingsDialog
        open={settingsDialog}
        setSettingsDialog={(e) => setSettingsDialog(e)}
      ></SettingsDialog>
      {addSystemFlag && (
        <AddSystemsDialog
          open={addSystemFlag}
          setAddSystemFlag={setAddSystemFlag}
          getAllDevices={getAllDevices}
        />
      )}

      {deleteFlagDialog?.flag && (
        <DeleteSystemDialog
          open={deleteFlagDialog.flag}
          setDeleteFlagDialog={setDeleteFlagDialog}
          system={deleteFlagDialog.system}
          getAllDevices={getAllDevices}
          setDeleteFlag={() => setDeleteFlag(false)}
        />
      )}
    </div>
  );
}
