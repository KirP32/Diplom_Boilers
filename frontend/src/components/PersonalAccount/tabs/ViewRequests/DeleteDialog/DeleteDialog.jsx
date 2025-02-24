import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import $api from "../../../../../http";

export default function DeleteDialog({ showDialog, setOpen, getSystems }) {
  async function handleDelete() {
    await $api
      .delete(
        `/deleteRequest/${showDialog.item.id}/${showDialog.item.system_name}`
      )
      .then(async (result) => {
        getSystems();
        setOpen(false);
      })
      .catch((error) => {
        console.log(error);
        setOpen(false);
      });
  }
  return (
    <Dialog open={true} onClose={() => setOpen(false)}>
      <DialogTitle id="alert-dialog-title">
        {`Удалить: ${showDialog.item.problem_name} ?`} <br />{" "}
        {`Модуль: ${showDialog.item.module}`}
      </DialogTitle>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Нет</Button>
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
