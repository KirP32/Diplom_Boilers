import styles from "./LogIn.module.scss";
import Input from "../Input/Input";
import Button from "../Button/Button";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { sha256 } from "js-sha256";
import $api from "../../http";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid";

export default function LogIn() {
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();
  const [token_access, setToken_access] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [decoded, setDecoded] = useState({});

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (token) {
      setToken_access(token);
      try {
        setDecoded(jwtDecode(token));
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  function comparePassword() {
    setVerifying(true);
    const hash = sha256(password);
    const UUID4 = uuidv4();

    if (checked == false) {
      localStorage.setItem("stay_logged", "false");
    } else {
      localStorage.setItem("stay_logged", "true");
    }
    const data = {
      login: login,
      password: hash,
      UUID4: UUID4,
      RememberMe: checked,
    };
    $api
      .post("/login", data)
      .then((response) => {
        const accessToken = response.data.accessToken;
        if (checked) {
          localStorage.setItem("accessToken", accessToken);
        } else {
          sessionStorage.setItem("accessToken", accessToken);
        }
        setToken_access(accessToken);
        navigate("/personalaccount");
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          console.log("User not found");
        } else if (
          error.response &&
          error.response.data.error === "Invalid credentials"
        ) {
          console.log("Invalid credentials");
        } else {
          console.log("An error occurred:", error.message);
        }
      })
      .finally(() => {
        setVerifying(false);
      });
  }

  function chengeCheckbox() {
    setChecked(!checked);
  }
  return (
    <main className={styles.main}>
      <div className={styles.main_wrapper}>
        <div className={styles.sign_in}>
          {!token_access && (
            <>
              <h4>Вход в систему ADS Line</h4>
              <div className={styles.sign_in__buttons}>
                <Input
                  type="text"
                  placeholder="Ваш логин"
                  value={login}
                  onChange={(event) => setLogin(event.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className={styles.sign_in__remember}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={chengeCheckbox}
                />
                <h5 onClick={chengeCheckbox} className={styles.no_select}>
                  Запомнить меня
                </h5>
              </div>
              <div className={styles.sign_in__login}>
                <Button
                  className={styles.sign_in_login_btn}
                  onClick={comparePassword}
                  disabled={verifying === true}
                >
                  Войти
                </Button>
                {/* <Link onClick={() => setRegFlag(true)} >Регистрация</Link> */}
                <Link to="/PersonalAccount">Забыли пароль?</Link>
              </div>
            </>
          )}
          {token_access && (
            <div className={styles.logged__wrapper}>
              <h4>Добро пожаловать, {decoded.login} </h4>
              <Link to="/PersonalAccount">Личный кабинет</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
