import { Fragment, useState } from "react";
import styles from './PersonalAccount.module.scss';
import Input from '../Input/Input';
import Button from '../Button/Button';
import axios from "axios";

export default function PersonalAccount() {

    const [devicesArray, setdevicesArray] = useState([]);
    const [deviceFindName, setdeviceFindName] = useState('');

    async function getAllDevices() {
        try {
            const response = await axios
                .get('http://localhost:8080/devices',
                    { // получение из БД девайсов пользователя в формате json
                        params: {
                            KEY: 12345,
                        }
                    });
            setdevicesArray(response.data);
            console.log(response.data);
        }
        catch (error) {
            console.log(error);
        }
    }

    return (
        <div className={styles.lk__wrapper}>
            <div className={styles.lk__wrapper__sidebar}>
                <div className={styles.lk__wrapper__sidebar__header}>
                    <Button onClick={getAllDevices} >Добавить устройство</Button>
                    <Input placeholder="Поиск устройств" value={deviceFindName} onChange={(event) => setdeviceFindName(event.target.value)} />
                </div>
                <div className={styles.lk__wrapper__sidebar__devices}>
                    {devicesArray &&
                        <>
                            {devicesArray
                                .filter((item) => item.name.toLowerCase().includes(deviceFindName.toLowerCase()))
                                .map((item) => (
                                    <div key={item.id} className={styles.devices_container}>
                                            <div className={`${styles[`circle__` + `${item.status}`]} ${styles.circle}`} />
                                        <h4 className={styles.device__text}>{item.name}</h4>
                                    </div>
                                ))
                            }
                        </>
                    }
                </div>
                <div className={styles.lk__wrapper__sidebar__options}>
                    <Button className={styles.lk__wrapper__sidebar__options__btn_delete}>Режим удаления</Button>
                    <Button>Настройки</Button>
                </div>
            </div>
            <div className={styles.lk__wrapper__main_content}>
                <div className="lk__wrapper__main__indicators">

                </div>
                <div className="lk__wrapper__main__device_info">

                </div>
                <div className="lk__wrapper__main__object">

                </div>
            </div>
        </div>
    )
}