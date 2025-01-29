import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
} from "@mui/material";
import $api from "../../../../http";

export default function DeleteSystemDialog({
  open,
  setDeleteFlagDialog,
  system,
  getAllDevices,
}) {
  async function handleDelete() {
    await $api
      .delete(`/deleteSystem/${system.name}`)
      .then((result) => {
        getAllDevices();
        setDeleteFlagDialog(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  return (
    <Dialog open={open} onClose={() => setDeleteFlagDialog(false)}>
      <DialogTitle id="alert-dialog-title">
        {`Удалить: ${system.name} ?`}
      </DialogTitle>
      <DialogActions>
        <Button onClick={() => setDeleteFlagDialog(false)}>Нет</Button>
        <Button
          onClick={handleDelete}
          autoFocus
          color="success"
          variant="contained"
        >
          Да
        </Button>
      </DialogActions>
    </Dialog>
  );
}
