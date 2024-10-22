import styles from './LogIn.module.scss'
import Input from '../Input/Input';
import Button from '../Button/Button';
import { Link, Navigate } from "react-router-dom"
import React, { Fragment, useState, useEffect, useRef } from 'react';
import { sha256 } from 'js-sha256';
import $api from '../../http';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

export default function LogIn() {
    const [checked, setChecked] = useState(false);
    const navigate = useNavigate();
    function chengeCheckbox() {
        setChecked(!checked);
    }
    const [token_access, setToken_access] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setToken_access(token);
        }
    }, []);

    function comparePassword() {
        const hash = sha256(password);
        // console.log(hash);
        // console.log(bcrypt.hashSync(hash));
        const data = {
            login: login,
            password: hash
        };

        $api
            .post('/login', data)
            .then((response) => {
                const accessToken = response.data.accessToken;
                localStorage.setItem('accessToken', accessToken);
                setToken_access(accessToken);
                navigate('/personalaccount');
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    console.log('User not found');
                } else if (error.response && error.response.data.error === 'Invalid credentials') {
                    console.log('Invalid credentials');
                } else {
                    console.log('An error occurred:', error.message);
                }
            });

    }
    return (
        <main className={styles.main}>
            <div className={styles.main_wrapper}>
                <div className={styles.sign_in}>
                    {!token_access && <>
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
                    </>
                    }
                    {token_access &&
                        <div className={styles.logged__wrapper}>
                            <h4>Добро пожаловать, {jwtDecode(token_access).login} </h4>
                            <Link to="/PersonalAccount">Личный кабинет</Link>
                        </div>
                    }
                </div>
            </div>
        </main>
    );
}