import styles from './SignUp.module.scss'
import { useState, useEffect } from "react";
import Input from '../Input/Input';
import Button from '../Button/Button';
import { Link } from "react-router-dom"
import $api from '../../http';
import { sha256 } from 'js-sha256';
import { useNavigate } from 'react-router-dom';

export default function SignUp({ updateRegFlag, ...props }) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [password_check, setPassword_check] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({ login: false, password: false, email: false });
    const navigate = useNavigate();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    function registration() {
        if (validate()) {
            const data = {
                login: login,
                password: sha256(password),
                email: email,
            };
            $api.post('/sign_up', data)
                .then((response) => {
                    $api
                        .post('/login', data)
                        .then((response) => {
                            const accessToken = response.data.accessToken;
                            localStorage.setItem('accessToken', accessToken);
                            navigate('/personalaccount');
                        })
                })
                .catch((error) => {
                    console.log(error.message);
                })
        }
    }

    function validate() {
        const loginError = login.length < 1;
        const passwordError = ((password.length < 1 && password_check.length) < 1 && password !== password_check);
        const emailError = !emailPattern.test(email);

        setErrors({
            login: loginError,
            password: passwordError,
            email: emailError
        });

        return !(loginError || passwordError || emailError);
    }

    return (
        <>
            <h4>Регистрация</h4>
            <div className={styles.sign_up__inputs}>
                <Input type="text" placeholder="Ваш логин" value={login} onChange={(event) => setLogin(event.target.value)} />
                {errors.login && <h5>Неправильный логин</h5>}
                <Input type='password' placeholder="Пароль" value={password} onChange={(event) => setPassword(event.target.value)} />
                <Input type='password' placeholder="Повторите пароль" value={password_check} onChange={(event) => setPassword_check(event.target.value)} />
                {errors.password && <h5>Пароли не совпадают</h5>}
                <Input type='email' placeholder="Почта" value={email} onChange={(event) => setEmail(event.target.value)} />
                {errors.email && <h5>Неправильный формат почты</h5>}
            </div>
            <div className={styles.sign_up__register}>
                <Button onClick={registration} className={styles.sign_up__register__button}>Регистрация</Button>
                <Link className={styles.sign_up__back} onClick={() => updateRegFlag(false)}>Назад</Link>
            </div>
        </>
    )
}