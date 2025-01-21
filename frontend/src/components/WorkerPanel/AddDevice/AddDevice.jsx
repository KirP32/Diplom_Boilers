import { useState } from "react";
import Button from "../../Button/Button";
import Input from "../../Input/Input";
import $api from "../../../http";
import styles from "./AddDevice.module.scss";
import DeviceDialog from "./DeviceDialog/DeviceDialog";
import AddEspDialog from "../../AddEspDialog/AddEspDialog";
import logout from "../../Logout/logout";
import { useNavigate } from "react-router-dom";

export default function AddDevice() {
  const [login, setLogin] = useState("");
  const [devicesArray, setdevicesArray] = useState([undefined]);
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState({});
  const [addEspDialog, setAddEspDialog] = useState(false);
  const navigate = useNavigate();

  async function findUser() {
    const body = { login: login };
    await $api
      .post("/getUser_info", body)
      .then((response) => {
        if (response.data.error) {
          console.log(response.data.error);
          setdevicesArray([null]);
        } else {
          setdevicesArray(response.data.devices);
          //console.log(response);
          // console.log(response.data.devices);
        }
      })
      .catch((err) => {
        console.log(err);
        if (
          err.status === 401 &&
          localStorage.getItem("stay_logged") == false
        ) {
          logout(navigate);
        }
      });
  }

  function editDevice(device) {
    setDevice(device);
    setOpen(true);
  }

  return (
    <div className={styles.add_device__wrapper}>
      <div className={styles.add_device__header}>
        <label htmlFor="user_login">Поиск по логину</label>
        <div className={styles.add_device__header__find}>
          <Input
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Логин пользователя"
            id="user_login"
          ></Input>
          <Button onClick={findUser}>
            <h4>Поиск</h4>
          </Button>
        </div>
      </div>
      <Button
        className={styles.add_device__button}
        onClick={() => {
          setAddEspDialog(true);
        }}
      >
        Добавить устройство
      </Button>
      <AddEspDialog
        open={addEspDialog}
        setDialog={(event) => {
          setAddEspDialog(event);
        }}
        findUser={findUser}
      ></AddEspDialog>
      {devicesArray[0] !== null &&
        devicesArray[0] !== undefined &&
        devicesArray.length > 0 && (
          <div className={styles.add_device__main__container}>
            {devicesArray.map((item) => (
              <div
                className={styles.item_container}
                key={item.device_uid}
                onClick={() => editDevice(item)}
              >
                <h4 className={styles.item_container__header}>
                  Устройство: {item.device_uid}
                </h4>
                <h4 className={styles.item_container__text}>
                  Содержит модули:
                </h4>
                <div className={styles.item_container__modules}>
                  <h5>список...</h5>
                </div>
              </div>
            ))}
          </div>
        )}
      {devicesArray[0] === null && (
        <div className={styles.user_not_found}>
          <h4>Пользователь не найден</h4>
        </div>
      )}
      {devicesArray.length === 0 && (
        <div className={styles.no_devices}>
          <h4>Устройств нет</h4>
        </div>
      )}
      {open && (
        <DeviceDialog
          setDialog={(e) => setOpen(e)}
          device={device}
          login={login}
          findUser={findUser}
        ></DeviceDialog>
      )}
    </div>
  );
}
