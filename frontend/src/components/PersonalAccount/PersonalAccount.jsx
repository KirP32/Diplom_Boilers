import { useCallback, useState, useEffect } from "react";
import styles from './PersonalAccount.module.scss';
import Input from '../Input/Input';
import Button from '../Button/Button';
import PopDialog from "../PopDialog/PopDialog";
import $api from "../../http";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

export default function PersonalAccount() {
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [devicesArray, setdevicesArray] = useState([]);
    const [deviceFindName, setdeviceFindName] = useState('');
    const [deviceObject, setDeviceObject] = useState();
    const [user_name, setUser_name] = useState('');
    const [indicator, setIndicator] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setUser_name(jwtDecode(token).login);
        }
    }, []);

    const navigate = useNavigate();

    const openDialog = (item) => {
        setSelectedItem(item);
        setOpen(true);
    };

    const getAllDevices = useCallback(async () => {
        try {
            const response = await $api.get('/test_esp');
            
            if (response.status === 200) {
                const devices = [formatResponseData(response.data)];
                setdevicesArray(devices);
                if (!deviceObject) {
                    setDeviceObject(devices[0]);
                }
            } else if (response.status === 401) {
                console.log('Unauthorized');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('Unauthorized');
            } else {
                //console.error(error);
            }
        }
    }, []);
    

    const updateInfo = (updatedBoiler) => {
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
        setdevicesArray(updatedDevices);
    };

    function logout() {
        $api
            .post('/logout')
            .then((response) => {
                localStorage.removeItem('accessToken');
                navigate('/');
            })
            .catch((error) => {
                console.log(error);
            });
    }

    useEffect(() => {
        getAllDevices();

        const intervalId = setInterval(() => {
            getAllDevices();
        }, 10000);

        return () => clearInterval(intervalId);
    }, [getAllDevices]);


    function sendEsp() {
        $api
            .get('/test_esp')
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });

    }

    const formatResponseData = (data) => {
        const boilers = [];
        for (let key in data) {
            if (key.startsWith('module_')) {
                boilers.push({
                    name: key,
                    t: data[key],
                    online: 'N/A'
                });
            }
        }
        return {
            id: 1,
            name: data.s_number,
            status: data.wsk_pump == '*ON' ? 'online' : 'offline',
            boilers: boilers
        };
    };

    async function turnOffEsp() {
        $api.put('/off_esp', {
            indicator: indicator ? '-' : '+',
        })
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
        setIndicator(!indicator);
    }

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
                                    <div key={item.name} className={styles.devices_container} onClick={() => setDeviceObject(item)}>
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
                    <div className={styles.lk__wrapper__main__indicators__profile}>
                        <span onClick={logout} className={`material-symbols-outlined ${styles.no_select}`}>
                            logout
                        </span>
                        <Button className={styles.lk__wrapper__main__indicators__btn}>{user_name}</Button>
                    </div>
                </div>
                <div className={styles.lk__wrapper__main__device_info}>
                    <div className={styles.section__wrapper}>
                        <section className={styles.lk__wrapper__main__device_info__header}><h4>{deviceObject.name} |</h4>  <div className={`${styles[`circle__` + `${deviceObject.status}`]} ${styles.circle} ${styles.no_select}`} /></section>
                        <section className={styles.lk__wrapper__main__device_info__connection}>
                            <span className={`material-symbols-outlined ${styles.no_select}`}>
                                wifi
                            </span>
                            <span className={`material-symbols-outlined ${styles.no_select}`}>
                                signal_cellular_3_bar
                            </span>
                        </section>
                    </div>
                    {/* Иконки в зависимости от wifi/связи */}
                </div>
                <div className={styles.lk__wrapper__main__object}>
                    <div className={styles.test_esp}>
                        <Button onClick={sendEsp}>Проверка</Button>
                        <Button onClick={turnOffEsp}>{indicator ? 'Выключить' : 'Включить'}</Button>
                    </div>
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
                                                {
                                                    String(item.t).includes('.')
                                                        ? String(item.t).split('.')[1].length >= 2
                                                            ? `${String(item.t).split('.')[0]}.${String(item.t).split('.')[1].slice(0, 2)}`
                                                            : item.t
                                                        : item.t
                                                }
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