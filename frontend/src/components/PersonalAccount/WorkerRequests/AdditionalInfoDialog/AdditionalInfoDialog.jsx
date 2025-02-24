/* eslint-disable react/prop-types */
import {
  Button,
  DialogTitle,
  DialogActions,
  Dialog,
  DialogContent,
  Box,
} from "@mui/material";

export default function AdditionalInfoDialog({
  open,
  item,
  setAdditionalOpen,
}) {
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onClose={() => setAdditionalOpen()}>
      <DialogTitle id="alert-dialog-title">
        <b>Система:</b> {item.system_name}
      </DialogTitle>
      <DialogContent>
        <Box>
          <p>
            <b>Создана:</b> {formatDate(item.created_at)}
          </p>
          <p>
            <b>Проблема:</b> {item.problem_name}
          </p>
          <p>
            <b>Описание:</b> {item.description}
          </p>
          <p>
            <b>Проблема с модулем:</b> {item.module}
          </p>
          <p>
            <b>Контактный номер:</b> {item.phone_number}
          </p>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAdditionalOpen()}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}
