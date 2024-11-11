import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import styles from './AddEspDialog.module.scss'
import $api from "../../http";
import { useState } from "react";

export default function AddEspDialog({ open, setDialog, findUser }) {

    const [device_uid, setDevice_uid] = useState('');
    const [user_login, setUser_login] = useState('');

    function handleclose() {
        setDialog(false);
    }

    function onFinish() {
        const data = {
            login: user_login,
            device_uid: device_uid
        }
        $api.post('/add_device', data)
            .then((response) => {
                if (response.data.code == 23502) {
                    alert('Пользователь не найден');
                }
                else if (response.data.code == 23505) {
                    alert('Устройство уже добавлено');
                }
                else if (response.data.code == 23500) {
                    alert('Устройство не найдено');
                }
                else {
                    findUser();
                    setDevice_uid('');
                    setUser_login('');
                    handleclose();
                }

            })
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <Dialog
            open={open}
            onClose={() => handleclose()}
        >
            <DialogTitle>Добавить устройство</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="esp"
                    label="Серийный номер"
                    onChange={(e) => { setDevice_uid(e.target.value) }}
                    type="text"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="user"
                    label="Логин пользователя"
                    onChange={(e) => { setUser_login(e.target.value) }}
                    type="text"
                    fullWidth
                    variant="standard"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleclose}>Отмена</Button>
                <Button type="submit" color="info" variant="contained" onClick={onFinish}>Добавить</Button>
            </DialogActions>
        </Dialog>
    )
}