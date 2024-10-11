import { Fragment, useCallback, useState, useEffect } from "react";
import styles from './PersonalAccount.module.scss';
import Input from '../Input/Input';
import Button from '../Button/Button';
import axios from "axios";
import PopDialog from "../PopDialog/PopDialog";

export default function PersonalAccount() {
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [devicesArray, setdevicesArray] = useState([]);
    const [deviceFindName, setdeviceFindName] = useState('');
    const [deviceObject, setDeviceObject] = useState({});
    const [buttonActive, setbuttonActive] = useState(false);

    const openDialog = (item) => {
        setSelectedItem(item);
        setOpen(true);
    };

    const getAllDevices = useCallback(async () => {
        // в get было http://185.46.10.111/api/devices http://localhost:8080/devices
        try {
            const response = await axios.get('http://185.46.10.111/api/devices', {
                params: {
                    KEY: 12345,
                }
            });
            setdevicesArray(response.data);
            setDeviceObject(response.data[0]);
            //console.log(response.data);
        } catch (error) {
            console.error('Сервер недоступен или выключен, пожалуйста, сообщите об ошибке');
        }
    }, []);

    const updateInfo = (updatedBoiler) => {
        //console.log('updateinfo triggered');
        const updatedDevices = devicesArray.map(device => {
            if (device.id === deviceObject.id) {
                const updatedBoilers = device.boilers.map(boiler => {
                    if (boiler.name === updatedBoiler.name) {
                        return { ...boiler, ...updatedBoiler };
                    }
                    return boiler;
                });
    
                return { ...device, boilers: updatedBoilers };
            }
            return device;
        });
        //console.log(updatedDevices);
        setdevicesArray(updatedDevices);
    };
    

    useEffect(() => {
        getAllDevices();
    }, [getAllDevices]);

    return (
        <div className={styles.lk__wrapper}>
            <div className={styles.lk__wrapper__sidebar}>
                <div className={styles.lk__wrapper__sidebar__header}>
                    <Button> <h4>Добавить устройство</h4></Button>
                    <Input placeholder="Поиск устройств" value={deviceFindName} onChange={(event) => setdeviceFindName(event.target.value)} />
                    <hr />
                </div>
                <div className={styles.lk__wrapper__sidebar__devices}>
                    {devicesArray &&
                        <>
                            {devicesArray
                                .filter((item) => item.name.toLowerCase().includes(deviceFindName.toLowerCase()))
                                .map((item) => (
                                    <div key={item.id} className={styles.devices_container} onClick={() => setDeviceObject(item)}>
                                        <div className={`${styles[`circle__` + `${item.status}`]} ${styles.circle} ${styles.no_select}`} />
                                        <h4 className={styles.device__text}>{item.name}</h4>
                                    </div>
                                ))
                            }
                        </>
                    }
                </div>
                <div className={styles.lk__wrapper__sidebar__options}>
                    <Button className={styles.lk__wrapper__sidebar__options__btn_delete}><h4>Режим удаления</h4></Button>
                    <Button className={styles.lk__wrapper__sidebar__options__btn_settings}><h4>Настройки</h4></Button>
                </div>
            </div>
            {(devicesArray.length > 0) && <div className={styles.lk__wrapper__main__content}>
                <div className={styles.lk__wrapper__main__indicators}>
                    <div className={styles.lk__wrapper__main__indicators__wrapper}>
                        <Button><h4>Датчики</h4> <span className="material-symbols-outlined">
                            device_thermostat
                        </span></Button>
                        <button><h4>График</h4> <span className="material-symbols-outlined">
                            query_stats
                        </span></button>
                        <button><h4>Ошибки</h4> <span className="material-symbols-outlined">
                            warning
                        </span></button>
                    </div>
                    <Button className={styles.lk__wrapper__main__indicators__btn}>user@yandex.ru</Button>
                </div>
                <div className={styles.lk__wrapper__main__device_info}>
                    <div className={styles.section__wrapper}>
                        <section className={styles.lk__wrapper__main__device_info__header}><h4>{deviceObject.name} |</h4>  <div className={`${styles[`circle__` + `${deviceObject.status}`]} ${styles.circle} ${styles.no_select}`} /></section>
                        <section className={styles.lk__wrapper__main__device_info__connection}>
                            <span className="material-symbols-outlined no_select">
                                wifi
                            </span>
                            <span className="material-symbols-outlined no_select">
                                signal_cellular_3_bar
                            </span>
                        </section>
                    </div>
                    {/* Иконки в зависимости от wifi/связи */}
                </div>
                <div className={styles.lk__wrapper__main__object}>
                    <div className={styles.lk__wrapper__main__object__wrapper}>
                        {deviceObject.boilers && <>
                            {deviceObject.boilers
                                .map((item) =>
                                (
                                    <div key={item.name} className={styles.lk__wrapper__main__object__container} onClick={() => openDialog(item)}>
                                        <div className={styles.lk__wrapper__main__object__container__header}>
                                            <h4>{item.name}</h4>
                                        </div>
                                        <div className={styles.lk__wrapper__main__object__container__body}>
                                            <span className={styles.lk__wrapper__main__object__container__body__info__span}>
                                                <span className="material-symbols-outlined">device_thermostat</span>
                                                {item.t}
                                            </span>
                                            <h5>Время работы:</h5>
                                            {item.online}
                                        </div>
                                    </div>
                                )
                                )
                            }
                        </>}
                        {selectedItem && (
                            <PopDialog 
                            open={open}
                            setDialog={(current) => setOpen(current)}
                            selectedItem={selectedItem}
                            updatedevices={updateInfo}
                            ></PopDialog>
                        )}
                    </div>
                </div>
            </div>}
            {devicesArray.length == 0 && <>
                <div className={`${styles.noContent}`}>
                    <h3>Для продолжения работы добавьте устройство</h3>
                </div>
            </>}
        </div>
    )
}