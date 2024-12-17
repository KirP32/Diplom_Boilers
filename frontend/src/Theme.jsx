import { jwtDecode } from "jwt-decode";
import React, { useEffect, createContext, useState, useCallback } from "react";

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
