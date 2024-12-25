import axios from "axios";

export const API_URL = `http://localhost:8080`; //http://185.46.10.111/api
//http://localhost:8080

const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

$api.interceptors.request.use((config) => {
  if (localStorage.getItem("stay_logged") === "false") {
    config.headers.accessToken = `${sessionStorage.getItem("accessToken")}`;
    // console.log(
    //   "Отправляю запрос с таким accessToken: ",
    //   sessionStorage.getItem("accessToken")
    // );
  } else {
    config.headers.accessToken = `${localStorage.getItem("accessToken")}`;
    // console.log(
    //   "Отправляю запрос с таким accessToken: ",
    //   localStorage.getItem("accessToken")
    // );
  }

  config.headers.authorization =
    "Bearer $2b$12$IDWkgcBO6qA8xXHovNrejefn9yiDJ4I5OJ4iDcyyNIzFyDeaasnTe";
  return config;
});

$api.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response.status === 401 &&
      error.config &&
      !error.config._isRetry
    ) {
      originalRequest._isRetry = true;
      // console.log("Пробую выдать авторизацию");

      const RememberMe = localStorage.getItem("stay_logged");
      try {
        const response = await axios.get(`${API_URL}/refresh`, {
          params: { stay_logged: RememberMe },
          withCredentials: true,
        });

        if (localStorage.getItem("stay_logged") === "false") {
          sessionStorage.setItem("accessToken", response.data.accessToken);
          // console.log(
          //   "Токен обновлён в sessionStorage:",
          //   response.data.accessToken
          // );
        } else {
          localStorage.setItem("accessToken", response.data.accessToken);
          // console.log(
          //   "Токен обновлён в localStorage:",
          //   response.data.accessToken
          // );
        }
        // console.log(localStorage.getItem("stay_logged"));
        originalRequest.headers.accessToken = response.data.accessToken;

        // console.log("Выдал авторизацию");

        return $api.request(originalRequest);
      } catch (e) {
        console.log("Ошибка авторизации");
        console.log(e);
        throw e;
      }
    }
    throw error;
  }
);

export default $api;
