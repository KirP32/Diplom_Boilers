import styles from './LogIn.module.scss'
import Input from '../Input/Input';
import Button from '../Button/Button';
import { Link } from "react-router-dom"
import React, { Fragment, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { sha256 } from 'js-sha256';

export default function LogIn() {
    const [checked, setChecked] = useState(false);

    function chengeCheckbox() {
        setChecked(!checked);
    }

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    function comparePassword() {
        const hash = sha256(password);
        // console.log(hash);
        // console.log(bcrypt.hashSync(hash));
        const data = {
            login: login,
            password: hash
        };

        axios
            .post('http://localhost:8080/login', data, { withCredentials: true })
            .then((response) => {
                const accessToken = response.data.accessToken;
                console.log(accessToken);
                localStorage.setItem('accessToken', accessToken);
            })
            .catch((error) => {
                if (error.status == 401) {
                    console.log('User not found');
                }
                else if (response.data.error == 'Invalid credentials')
                    console.log('Invalid credentials');
            })
    }

    return (
        <main className={styles.main}>
            <div className={styles.main_wrapper}>
                <div className={styles.sign_in}>
                    <h4>Вход в систему ADS Line</h4>
                    <div className={styles.sign_in_buttons}>
                        <Input type="text" placeholder="Ваш логин" value={login} onChange={(event) => setLogin(event.target.value)} />
                        <Input type='password' placeholder="Пароль" value={password} onChange={(event) => setPassword(event.target.value)} />
                    </div>
                    <div className={styles.sign_in_remember}>
                        <input type="checkbox" checked={checked} onChange={chengeCheckbox} />
                        <h5 onClick={chengeCheckbox} className={styles.no_select}>Запомнить меня</h5>
                    </div>
                    <div className={styles.sign_in_login}>
                        <Button className={styles.sign_in_login_btn} onClick={comparePassword}>Войти</Button>
                        <Link to="/PersonalAccount">Забыли пароль?</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}