import React from "react";
import DeviceInfo from "../../additionalComponents/DeviceInfo/DeviceInfo";
import MainObjectWrapper from "../../additionalComponents/Main_object_wrapper/MainObjectWrapper";
import Button from "../../../Button/Button";

export default function Sensors({
  deviceObject,
  setdevicesArray,
  devicesArray,
}) {
  return (
    <>
      <DeviceInfo deviceObject={deviceObject} />
      <MainObjectWrapper
        devicesArray={devicesArray}
        deviceObject={deviceObject}
        setdevicesArray={setdevicesArray}
      />
    </>
  );
}
