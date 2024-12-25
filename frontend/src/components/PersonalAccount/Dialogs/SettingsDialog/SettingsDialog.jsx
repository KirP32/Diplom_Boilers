import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useContext } from "react";
import Switch from "@mui/material/Switch";
import Button_M from "@mui/material/Button";
import styles from "./SettingsDialog.module.scss";
import { ThemeContext } from "../../../../Theme";
import { useNavigate } from "react-router-dom";
import logout from "../../../Logout/logout";

export default function SettingsDialog({ open, setSettingsDialog }) {
  function onFinish() {
    setSettingsDialog(false);
  }
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const label = { inputProps: { "aria-label": "Switch demo" } };
  return (
    <Dialog open={open} onClose={() => onFinish()} fullWidth maxWidth="xs">
      <DialogTitle style={{ textAlign: "center" }}>Тема сайта</DialogTitle>
      <DialogContent className={styles.dialog_content}>
        <span className="material-icons">dark_mode</span>
        <Switch
          checked={theme === "dark-theme" ? false : true}
          onChange={() => toggleTheme()}
          {...label}
        />
        <span className="material-icons-outlined">light_mode</span>
      </DialogContent>
      <DialogActions style={{ justifyContent: "space-between" }}>
        <Button_M
          onClick={() => logout(navigate)}
          color="error"
          variant="contained"
        >
          Выйти из системы
        </Button_M>
        <Button_M onClick={() => onFinish()} color="info" variant="contained">
          Закрыть
        </Button_M>
      </DialogActions>
    </Dialog>
  );
}
