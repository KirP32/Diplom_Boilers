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

  async function generateName() {
    await $api
      .get("/getFreeName")
      .then((result) => setSystemName(result.data.freeName))
      .catch((error) => {
        console.log(error);
      });
  }

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
        <DialogActions sx={{ display: "flex", justifyContent: "space-around" }}>
          <Button color="primary" variant="outlined" onClick={generateName}>
            Генерация
          </Button>
          <section style={{ gap: "15px", display: "flex", padding: 15 }}>
            <Button onClick={onClose} color="error" variant="outlined">
              Отмена
            </Button>
            <Button
              onClick={handleCreate}
              color="success"
              variant="contained"
              disabled={!systemName?.trim()}
            >
              Создать
            </Button>
          </section>
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
