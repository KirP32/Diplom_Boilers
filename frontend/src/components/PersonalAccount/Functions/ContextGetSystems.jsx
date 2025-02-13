/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { createContext } from "react";

const GetSystemContext = createContext(null);

const name = () => {
  console.log("Отправляю данные на сервер");
};

const SystemProvider = ({ children }) => {
  const api = ""; // api для общения
  const result = "Ответ получен";
  // можно добавить useState, useEffect
  return (
    <GetSystemContext.Provider value={{ result }}>
      {children}
    </GetSystemContext.Provider>
  );
};

export { SystemProvider, GetSystemContext };
