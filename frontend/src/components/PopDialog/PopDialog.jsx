import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import styles from './PopDialog.module.scss'
import Button_M from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import { useState, useEffect } from "react";

export default function PopDialog({ open, setDialog, selectedItem, updatedevices }) {

    const [value, setValue] = useState(selectedItem?.t);

    const marks = [
        {
            value: 0,
            label: '0°C',
        },
        {
            value: 50,
            label: '50°C',
        },
        {
            value: 100,
            label: '100°C',
        },
    ];

    useEffect(() => {
        if (selectedItem) {
            setValue(selectedItem.t);
        }
    }, [selectedItem]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    function onFinish() {
        setDialog(false)
        selectedItem.t = value;
        updatedevices(selectedItem);
    }

    return (
        <Dialog open={open} onClose={() => onFinish()} fullWidth maxWidth="xs">
            <DialogTitle style={{ textAlign: "center" }}>{selectedItem.name}</DialogTitle>
            <DialogContent>
                <div className={styles.dialog__wrapper}>
                    <h4 className={styles.dialog__status}>Датчики:</h4>
                    <div className={styles.dialog__temperature}>
                        {selectedItem.t}
                        <span className="material-symbols-outlined">
                            device_thermostat
                        </span>
                    </div>
                    <div className={styles.dialog__time}>
                        <h4>Время работы</h4>
                        <h4>{selectedItem.online}</h4>
                    </div>
                    <div className={styles.dialog__setTemp}>
                        <h4>{value}</h4>
                        <Slider
                            aria-label="temperature"
                            value={value}
                            onChange={handleChange}
                            marks={marks}
                            sx={{
                                color: 'grey',
                                '& .MuiSlider-thumb': {
                                    color: 'orange',
                                },
                            }} />
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button_M onClick={() => onFinish()} color="info" variant="contained">
                    Закрыть
                </Button_M>
            </DialogActions>
        </Dialog>
    )
}