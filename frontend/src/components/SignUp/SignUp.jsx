import styles from './SignUp.module.scss'
import { useState, useEffect } from "react";
import Input from '../Input/Input';
import Button from '../Button/Button';

export default function SignUp({ ...props }) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [password_check, setPassword_check] = useState('');
    const [email, setEmail] = useState('');

    function registration () {
        
    }
    
    return (
        <>
            <h4>Регистрация</h4>
            <div className={styles.sign_up__inputs}>
                <Input type="text" placeholder="Ваш логин" value={login} onChange={(event) => setLogin(event.target.value)} />
                <Input type='password' placeholder="Пароль" value={password} onChange={(event) => setPassword(event.target.value)} />
                <Input type='password' placeholder="Повторите пароль" value={password_check} onChange={(event) => setPassword_check(event.target.value)} />
                <Input type='email' placeholder="Почта" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className={styles.sign_up__register}>
                <Button className={styles.sign_in_login_btn} onClick={registration}>Регистрация</Button>
            </div>
        </>
    )
}