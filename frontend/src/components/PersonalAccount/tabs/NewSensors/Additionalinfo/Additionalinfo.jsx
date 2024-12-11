import React from "react";
import DeviceInfo from "../../../additionalComponents/DeviceInfo/DeviceInfo";

export default function Additionalinfo({ activeSensor }) {
  const deviceObject = { ...activeSensor, name: activeSensor.s_number };
  return (
    <>
      <DeviceInfo deviceObject={deviceObject} />
      <div className="sensor_indicator" style={{ textAlign: "center" }}>
        <h4 style={{ fontSize: 19, color: "white" }}>
          Данные сенсоров: {`${activeSensor.data}`}
        </h4>
      </div>
    </>
  );
}
