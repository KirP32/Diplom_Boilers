import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import $api from '../../../../http';

export default function DeviceDialog({ setDialog, device, findUser, login }) {

    function onClose() {
        setDialog(false);
    }

    async function onDelete() {
        $api.delete(`/delete_device/${device.device_uid}`, {
            headers: {
                'Login': login
            }
        })
            .then((result) => {
                findUser();
                onClose();
            })
            .catch(error => {
                console.log(error);
            });

    }

    return (
        <Dialog
            open={true}
            onClose={() => onClose()}
        >
            <DialogTitle>{device.device_uid}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Информация...
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onDelete} >Удалить</Button>
                <Button onClick={onClose} variant='contained' color='success'>ОК</Button>
            </DialogActions>
        </Dialog>
    )
}