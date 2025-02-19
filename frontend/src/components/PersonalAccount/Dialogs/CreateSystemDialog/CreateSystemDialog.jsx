import { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from "@mui/material";
import $api from "../../../../http";

export default function CreateSystemDialog({ open, onClose }) {
  const [systemName, setSystemName] = useState("");

  const handleCreate = async () => {
    console.log("Создание системы:", systemName);
    await $api
      .post("/createSystem", { system_name: systemName })
      .then((result) => {
        console.log(result);
        onClose();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle style={{ textAlign: "center" }}>Создать систему</DialogTitle>
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
  );
}
