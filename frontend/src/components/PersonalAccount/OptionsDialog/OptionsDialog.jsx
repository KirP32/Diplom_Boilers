import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import styles from './OptionsDialog.module.scss';
import Button_M from '@mui/material/Button';

export default function OptionsDialog({ open, user, setOptions }) {

    function onFinish() {
        setOptions(false);
    }

    return (
        <Dialog open={open} onClose={() => onFinish()} fullWidth maxWidth="xs">
            <DialogTitle style={{ textAlign: "center" }}>{user.user_name}</DialogTitle>
            <DialogContent>
                <h4>{user.user_email}</h4>
            </DialogContent>
            <DialogActions>
                <Button_M onClick={() => onFinish()} color="info" variant="contained">
                    Закрыть
                </Button_M>
            </DialogActions>
        </Dialog>
    );
}