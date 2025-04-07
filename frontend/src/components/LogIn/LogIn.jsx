import styles from "./LogIn.module.scss";
import Input from "../Input/Input";
import Button from "../Button/Button";
import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { sha256 } from "js-sha256";
import $api from "../../http";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import { ThemeContext } from "../../Theme";

export default function LogIn() {
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();
  const [token_access, setToken_access] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [decoded, setDecoded] = useState({});
  const { refreshAccess } = useContext(ThemeContext);
  const [errorFlag, setErrorFlag] = useState({ login: false, password: false });

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
        refreshAccess(jwtDecode(accessToken).access_level);
      })
      .catch((error) => {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              if (error.response.data.error === "User not found") {
                setErrorFlag({ login: true, password: false });
              } else if (error.response.data.error === "Invalid credentials") {
                setErrorFlag({ login: false, password: true });
              } else {
                console.log("Ошибка валидации:", error.response.data);
              }
              break;
            default:
              console.log("Ошибка:", error.response.data);
          }
        } else if (error.request) {
          console.log("Нет ответа от сервера");
        } else {
          console.log("Ошибка запроса:", error.message);
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      comparePassword();
                    }
                  }}
                />
                {errorFlag.login && (
                  <h5 className={styles.error}>Неверный логин</h5>
                )}
                <Input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      comparePassword();
                    }
                  }}
                />
                {errorFlag.password && (
                  <h5 className={styles.error}>Неверный пароль</h5>
                )}
              </div>
              <div className={styles.sign_in__remember}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={chengeCheckbox}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      chengeCheckbox();
                    }
                  }}
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
          {}
        </div>
      </div>
    </main>
  );
}
