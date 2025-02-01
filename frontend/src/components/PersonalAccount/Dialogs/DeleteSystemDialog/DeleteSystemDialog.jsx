import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import $api from "../../../../http";

export default function DeleteSystemDialog({
  open,
  setDeleteFlagDialog,
  system,
  getAllDevices,
  setDeleteFlag,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!system?.name || isLoading) return;

    setIsLoading(true);

    try {
      await $api.delete(`/deleteSystem/${system.name}`);
      await getAllDevices();
      setDeleteFlag();
      setDeleteFlagDialog(false);
    } catch (error) {
      console.error("Ошибка при удалении системы:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => setDeleteFlagDialog(false)}>
      <DialogTitle>{`Удалить: ${system?.name} ?`}</DialogTitle>
      <DialogActions>
        <Button onClick={() => setDeleteFlagDialog(false)} disabled={isLoading}>
          Нет
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Да"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
