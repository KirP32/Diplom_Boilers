import $api from "../../http";

export default function logout(navigate) {
    $api
        .post('/logout')
        .then(() => {
            localStorage.removeItem('accessToken');
            sessionStorage.removeItem('accessToken');
            navigate('/');
        })
        .catch((error) => {
            console.log(error);
        });
}
