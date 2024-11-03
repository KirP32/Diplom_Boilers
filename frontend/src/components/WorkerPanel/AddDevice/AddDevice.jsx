import { useState } from "react";
import Button from "../../Button/Button";
import Input from "../../Input/Input";
import $api from "../../../http";
import styles from './AddDevice.module.scss';

export default function AddDevice() {

    const [login, setLogin] = useState('');
    const [devicesArray, setdevicesArray] = useState([]);

    async function findUser() {
        const body = { login: login };
        await $api.post('/getUser_info', body)
            .then((response) => {
                if (response.data.error) {
                    console.log(response.data.error);
                    setdevicesArray([]);
                }
                else {
                    setdevicesArray(response.data.devices);
                    // console.log(response.data.devices);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }

    return (
        <div className={styles.add_device__wrapper}>
            <div className={styles.add_device__header}>
                <label htmlFor='user_login'>Поиск по логину</label>
                <Input onChange={(e) => setLogin(e.target.value)} placeholder='Логин пользователя' id='user_login'></Input>
                <Button onClick={findUser} ><h4>Поиск</h4></Button>
            </div>
            {devicesArray && <div className={styles.add_device__main__container}>
                {devicesArray.map(item =>
                    <div className={styles.item_container} key={item.device_id}>
                        <h4 className={styles.item_container__header}>Устройство: {item.device_id}</h4>
                        <h4 className={styles.item_container__text}>Содержит модули:</h4>
                        <div className={styles.item_container__modules}>
                            <h5>список...</h5>
                        </div>
                    </div>)
                }
            </div>}
        </div>
    )
}