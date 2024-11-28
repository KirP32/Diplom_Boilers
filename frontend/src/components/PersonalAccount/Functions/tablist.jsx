import Sensors from "../tabs/Sensors/Sensors";

export default function tablist(tabname, obj, devicesArray, someFnc) {
  switch (tabname) {
    case "sensors":
      return (
        <Sensors
          deviceObject={deviceObject}
          devicesArray={devicesArray}
          setdevicesArray={(e) => someFnc(e)}
        />
      );
      break;
    case "info":
      return <></>;
      break;
    default:
      break;
  }
}
