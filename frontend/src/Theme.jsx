import { jwtDecode } from "jwt-decode";
import React, { useEffect, createContext, useState, useCallback } from "react";
import $api from "./http";
import formatResponseData from "./components/PersonalAccount/Functions/formatResponseData";

const ThemeContext = createContext();

const getTheme = () => {
  const theme = localStorage.getItem("theme");
  if (!theme) {
    localStorage.setItem("theme", "dark-theme");
    return "dark-theme";
  } else {
    return theme;
  }
};

const getAccessLevel = () => {
  try {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (!token) return 0;
    return jwtDecode(token)?.access_level || 0;
  } catch (error) {
    console.error("Token decode error:", error);
    return 0;
  }
};

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getTheme);
  const [access_level, setAccesslevel] = useState(getAccessLevel());
  const [devicesArray, setDevicesArray] = useState([]);
  const [deviceObject, setDeviceObject] = useState(null);
  const getAllDevices = useCallback(async () => {
    try {
      const response = await $api.get("/getSystems");
      if (response.status === 200) {
        const devices = formatResponseData(response.data);
        setDevicesArray(devices);
        if (!deviceObject) {
          setDeviceObject(devices[0]);
        }
      } else if (response.status === 401) {
        console.log("Unauthorized");
      }
    } catch (error) {
      if (
        ((error.response && error.response?.status === 401) ||
          error?.response?.status === 400) &&
        !flag_error
      ) {
        alert("Ваш сеанс истёк, пожалуйста, войдите снова");
        logout(navigate);
        flag_error = true;
      } else {
        console.error(error);
      }
    }
  }, [deviceObject]);

  function refreshAccess(access_level) {
    setAccesslevel(access_level);
  }

  function toggleTheme() {
    if (theme === "dark-theme") {
      setTheme("light-theme");
    } else {
      setTheme("dark-theme");
    }
  }

  useEffect(() => {
    const refreshTheme = () => {
      localStorage.setItem("theme", theme);
    };

    refreshTheme();
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        access_level,
        refreshAccess,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
