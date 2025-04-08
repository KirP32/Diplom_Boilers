/* eslint-disable react/prop-types */
import { useEffect, createContext, useState } from "react";
import $api from "./http";

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

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getTheme);
  const [access_level, setAccesslevel] = useState(null);

  useEffect(() => {
    const getAccessLevel = async () => {
      try {
        const result = await $api.get("/getUserAccessLevel");
        setAccesslevel(result.data.accesslevel);
      } catch (error) {
        console.error(error);
        setAccesslevel(0);
      }
    };
    getAccessLevel();
  }, []);

  function refreshAccess(newAccessLevel) {
    setAccesslevel(newAccessLevel);
  }
  function toggleTheme() {
    setTheme((prevTheme) =>
      prevTheme === "dark-theme" ? "light-theme" : "dark-theme"
    );
  }

  useEffect(() => {
    localStorage.setItem("theme", theme);
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
