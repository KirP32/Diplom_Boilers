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

export default function SettingsDialog({ open, setSettingsDialog }) {
  function onFinish() {
    setSettingsDialog(false);
  }
  const { theme, toggleTheme } = useContext(ThemeContext);

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
      <DialogActions>
        <Button_M onClick={() => onFinish()} color="info" variant="contained">
          Закрыть
        </Button_M>
      </DialogActions>
    </Dialog>
  );
}
