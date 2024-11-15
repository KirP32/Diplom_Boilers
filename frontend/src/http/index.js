import axios from 'axios';

export const API_URL = `http://localhost:8080` //http://185.46.10.111/api
//http://localhost:8080
const logged = localStorage.getItem("stay_logged");
const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL
})

$api.interceptors.request.use((config) => {
    if (localStorage.getItem('stay_logged') == "false") {
        config.headers.accessToken = `${sessionStorage.getItem('accessToken')}`
    }
    else {
        config.headers.accessToken = `${localStorage.getItem('accessToken')}`
    }

    config.headers.authorization = 'Bearer $2b$12$IDWkgcBO6qA8xXHovNrejefn9yiDJ4I5OJ4iDcyyNIzFyDeaasnTe';
    return config;
})

$api.interceptors.response.use((config) => {
    return config;
}, async (error) => {
    const originalRequest = error.config;
    if (((error.response.status === 401) && error.config && !error.config._isRetry) && logged == "true") {
        originalRequest._isRetry = true;
        try {
            const response = await axios.get(`${API_URL}/refresh`, { withCredentials: true })
            localStorage.setItem('accessToken', response.data.accessToken);
            return $api.request(originalRequest);
        } catch (e) {
            // console.log('НЕ АВТОРИЗОВАН')
        }
    }
    throw error;
})

export default $api;