/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Snackbar,
  Alert,
  Slide,
} from "@mui/material";
import $api from "../../../../http";

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}
export default function CreateSystemDialog({ open, onClose, getAllDevices }) {
  const [systemName, setSystemName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCreate = async () => {
    console.log("Создание системы:", systemName);
    try {
      await $api.post("/createSystem", {
        system_name: systemName,
      });
      getAllDevices();
      onClose();
    } catch (error) {
      console.log(error);
      if (error.response?.data?.error === "Такая система уже существует") {
        setErrorMessage("Система с таким названием уже существует!");
      } else {
        setErrorMessage("Ошибка добавления системы");
      }
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle style={{ textAlign: "center" }}>
          Создать систему
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Название системы"
            variant="outlined"
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="info" variant="contained">
            Отмена
          </Button>
          <Button
            onClick={handleCreate}
            color="primary"
            variant="contained"
            disabled={!systemName.trim()}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
