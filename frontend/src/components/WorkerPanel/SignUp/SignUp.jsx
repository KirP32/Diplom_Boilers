import styles from './SignUp.module.scss'
import { useState } from "react";
import Input from '../../Input/Input';
import Button from '../../Button/Button';
import $api from '../../../http';
import { sha256 } from 'js-sha256';
import logout from '../../Logout/logout';
import { useNavigate } from 'react-router-dom';

export default function SignUp({ updateRegFlag, ...props }) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [password_check, setPassword_check] = useState('');
    const [email, setEmail] = useState('');
    const [contract, setContract] = useState('');
    const [errors, setErrors] = useState({ login: false, password: false, email: false });
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const [sign_failure, setSign_failure] = useState(false);
    const navigate = useNavigate();

    function registration() {
        if (validate()) {
            const data = {
                login: login,
                password: sha256(password),
                email: email,
            };
            $api.post('/sign_up', data)
                .then((response) => {
                    console.log(response);
                    setSign_failure(false);
                })
                .catch((error) => {
                    console.log(error.message);
                    if (error.status === 401) {
                        logout(navigate);
                    }
                    setSign_failure(true);
                    setTimeout(() => {
                        setSign_failure(false);
                    }, 5000);
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
        <div className={styles.sign_up__wrapper}>
            <div className={styles.sign_up__wrapper__content}>
                <h4>Регистрация</h4>
                <div className={styles.sign_up__inputs}>
                    <Input type="text" placeholder="Логин пользователя" value={login} onChange={(event) => setLogin(event.target.value)} />
                    {errors.login && <h5 className={styles.error}>Неправильный логин</h5>}
                    <Input type='password' placeholder="Пароль" value={password} onChange={(event) => setPassword(event.target.value)} />
                    <Input type='password' placeholder="Повторите пароль" value={password_check} onChange={(event) => setPassword_check(event.target.value)} />
                    {errors.password && <h5 className={styles.error}>Пароли не совпадают</h5>}
                    <Input type='email' placeholder="Почта" value={email} onChange={(event) => setEmail(event.target.value)} />
                    {errors.email && <h5 className={styles.error}>Неправильный формат почты</h5>}
                    <Input type='email' placeholder="Номер договора" value={contract} onChange={(event) => setContract(event.target.value)} />
                </div>
                <div className={styles.sign_up__register}>
                    <Button onClick={registration} className={styles.sign_up__register__button}>Регистрация</Button>
                    {/* <Link className={styles.sign_up__back} onClick={() => updateRegFlag(false)}>Назад</Link> */}
                </div>
            </div>
            {sign_failure && <div className={styles.registration__failed}>
                <h4>Пользователь уже существует</h4>
            </div>}
        </div>
    )
}