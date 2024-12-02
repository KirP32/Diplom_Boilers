import React from "react";
import ObjectWrapper from "./../ObjectWrapper/ObjectWrapper";
import { useState } from "react";
import styles from "./MainObjectWrapper.module.scss";
import Button from "../../../Button/Button";
import PopDialog from "../../Dialogs/PopDialog/PopDialog";
import $api from "../../../../http";

export default function MainObjectWrapper({
  devicesArray,
  deviceObject,
  setdevicesArray,
}) {
  const [indicator, setIndicator] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [open, setOpen] = useState(false);
  // console.log("devicesArray triggered");
  // console.log(devicesArray);
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

  const openDialog = (item) => {
    setSelectedItem(item);
    setOpen(true);
  };

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
    <div className={styles.main__object}>
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
      {selectedItem && (
        <PopDialog
          open={open}
          setDialog={(current) => setOpen(current)}
          selectedItem={selectedItem}
          updatedevices={updateInfo}
        ></PopDialog>
      )}
    </div>
  );
}
