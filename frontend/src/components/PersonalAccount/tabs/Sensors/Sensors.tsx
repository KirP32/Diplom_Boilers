import React from "react";
import DeviceInfo from "../../additionalComponents/DeviceInfo/DeviceInfo";
import MainObjectWrapper from "../../additionalComponents/Main_object_wrapper/MainObjectWrapper";

export default function Sensors({
  deviceObject,
  setdevicesArray,
  devicesArray,
}) {
  return (
    <>
      <DeviceInfo deviceObject={deviceObject} />
      <MainObjectWrapper
        deviceObject={deviceObject}
        setdevicesArray={(e: any) => setdevicesArray(e)}
        devicesArray={devicesArray}
      />
    </>
  );
}
