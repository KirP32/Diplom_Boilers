import styles from './LogIn.module.scss'
import Input from '../Input/Input';
import Button from '../Button/Button';
import { Link } from "react-router-dom"
import React, { Fragment, useState, useEffect } from 'react';

export default function LogIn() {
    const [checked, setChecked] = useState(false);

    function chengeCheckbox() {
        setChecked(!checked);
    }
    return (
        <main className={styles.main}>
            <div className={styles.main_wrapper}>
                <div className={styles.sign_in}>
                    <h4>Вход в систему ADS Line</h4>
                    <div className={styles.sign_in_buttons}>
                        <Input placeholder="Ваш ключ / Логин" />
                        <Input type='password' placeholder="Пароль" />
                    </div>
                    <div className={styles.sign_in_remember}>
                        <input type="checkbox" checked={checked} onChange={chengeCheckbox} />
                        <h5 onClick={chengeCheckbox} className={styles.no_select}>Запомнить меня</h5>
                    </div>
                    <div className={styles.sign_in_login}>
                        <Button>Войти</Button>  
                        <Link to="/PersonalAccount">Забыли пароль?</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}