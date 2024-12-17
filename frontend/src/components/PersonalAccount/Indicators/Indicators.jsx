import { jwtDecode } from "jwt-decode";
import Button from "../../Button/Button";
import OptionsDialog from "./../Dialogs/OptionsDialog/OptionsDialog";
import { useState, useEffect } from "react";
import styles from "./Indicators.module.scss";
import $api from "../../../http";
import { Menu, MenuItem } from "@mui/material";
import logout from "../../Logout/logout";
import { useNavigate } from "react-router-dom";

export default function Indicators({ setSelectedTab, tab }) {
  const [user_name, setUser_name] = useState("");
  const [options_flag, setOptions_flag] = useState(false);
  const [user_email, setUserEmail] = useState(null);
  const [monitoringAnchorEl, setMonitoringAnchorEl] = useState(null);
  const [systemAnchorEl, setSystemAnchorEl] = useState(null);
  const [requestsAnchorEl, setRequestsAnchorEl] = useState(null);
  const navigate = useNavigate();
  console.log("Indicators render");

  const handleOpenMonitoringMenu = (event) => {
    setMonitoringAnchorEl(event.currentTarget);
  };

  const handleOpenSystemMenu = (event) => {
    setSystemAnchorEl(event.currentTarget);
  };

  const handleOpenRequestsMenu = (event) => {
    setRequestsAnchorEl(event.currentTarget);
  };

  const handleClose = (tabName) => {
    if (tabName) {
      setSelectedTab(tabName);
    }
    setMonitoringAnchorEl(null);
    setSystemAnchorEl(null);
    setRequestsAnchorEl(null);
  };

  useEffect(() => {
    $api
      .post("/getUser_email")
      .then((result) => {
        setUserEmail(result?.data?.email);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [user_email]);

  useEffect(() => {
    const token =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken");
    if (token) {
      setUser_name(jwtDecode(token).login);
    }
  }, []);

  return (
    <div className={styles.indicators}>
      <div className={styles.indicators__wrapper}>
        <Button onClick={handleOpenMonitoringMenu}>
          <h4
            className={
              ["mnemoscheme", "information", "drawing", "sensors"].includes(tab)
                ? `${styles.active}`
                : ""
            }
          >
            Мониторинг
          </h4>
          <span
            className={`material-icons-outlined ${
              ["mnemoscheme", "information", "drawing", "sensors"].includes(tab)
                ? `${styles.active}`
                : ""
            }`}
          >
            query_stats
          </span>
        </Button>
        <Menu
          className={styles.menu}
          anchorEl={monitoringAnchorEl}
          open={Boolean(monitoringAnchorEl)}
          onClose={() => handleClose()}
        >
          <MenuItem onClick={() => handleClose("mnemoscheme")}>
            Мнемосхема
          </MenuItem>
          <MenuItem onClick={() => handleClose("information")}>
            Информация
          </MenuItem>
          <MenuItem onClick={() => handleClose("drawing")}>Чертёж</MenuItem>
          <MenuItem onClick={() => handleClose("sensors")}>Sensors</MenuItem>
        </Menu>

        <Button onClick={handleOpenSystemMenu}>
          <h4
            className={
              ["systemInfo", "indicators", "documentation"].includes(tab)
                ? `${styles.active}`
                : ""
            }
          >
            О системе
          </h4>
          <span
            className={`material-icons-outlined ${
              ["systemInfo", "indicators", "documentation"].includes(tab)
                ? `${styles.active}`
                : ""
            }`}
          >
            info
          </span>
        </Button>
        <Menu
          className={styles.menu}
          anchorEl={systemAnchorEl}
          open={Boolean(systemAnchorEl)}
          onClose={() => handleClose()}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <MenuItem onClick={() => handleClose("systemInfo")}>
            Информация
          </MenuItem>
          <MenuItem onClick={() => handleClose("indicators")}>
            Показатели
          </MenuItem>
          <MenuItem onClick={() => handleClose("documentation")}>
            Документация
          </MenuItem>
        </Menu>

        <Button onClick={handleOpenRequestsMenu}>
          <h4
            className={
              ["viewRequests", "createRequests", "additionalRequests"].includes(
                tab
              )
                ? `${styles.active}`
                : ""
            }
          >
            Заявки
          </h4>
          <span
            className={`material-icons-outlined ${
              ["viewRequests", "createRequests", "additionalRequests"].includes(
                tab
              )
                ? `${styles.active}`
                : ""
            }`}
          >
            warning
          </span>
        </Button>
        <Menu
          className={styles.menu}
          anchorEl={requestsAnchorEl}
          open={Boolean(requestsAnchorEl)}
          onClose={() => handleClose()}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={() => handleClose("viewRequests")}>
            Просмотр
          </MenuItem>
          <MenuItem onClick={() => handleClose("createRequests")}>
            Создать
          </MenuItem>
          <MenuItem onClick={() => handleClose("additionalRequests")}>
            Дополнительно
          </MenuItem>
        </Menu>
      </div>
      <div className={styles.indicators__profile}>
        <span
          onClick={() => logout(navigate)}
          className={`material-icons-outlined ${styles.no_select}`}
        >
          logout
        </span>
        <Button
          className={styles.indicators__btn}
          onClick={() => setOptions_flag(!options_flag)}
        >
          <h4>{user_name}</h4>
        </Button>
      </div>
      <OptionsDialog
        open={options_flag}
        user={{ user_name, user_email }}
        setOptions={(e) => setOptions_flag(e)}
      ></OptionsDialog>
    </div>
  );
}
