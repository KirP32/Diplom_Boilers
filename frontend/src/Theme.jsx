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
  const [access_level, setAccesslevel] = useState(0);

  useEffect(() => {
    const getAccessLevel = async () => {
      await $api
        .get("/getUserAccessLevel")
        .then((result) => {
          setAccesslevel(result.data.accesslevel);
        })
        .catch((error) => {
          console.error(error);
          setAccesslevel(0);
        });
    };
    getAccessLevel();
  }, []);
  // когда приходит значение access_level, не синхронизированно
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
