import { useState } from 'react'
import axios from "axios";

export default function SendRequest() {
    let [data, setData] = useState({ id: "", lastchanges: "" });
    const [response, setResponse] = useState("");
    const handleSubmit = (event) => {
        let boiler_key = 'esptest';
        data = { ...data, boiler_key: boiler_key }
        event.preventDefault();
        axios
            .post("http://localhost:8080/info", data)
            .then((response) => {
                setResponse(response.data);
            })
            .catch((error) => {
                console.log(error);
                setResponse("Произошла ошибка");
            });
    };
    const handleChange = (event) => {
        setData({ ...data, [event.target.name]: event.target.value });
    };
    return (
        <>
            <form onSubmit={handleSubmit}>
                <label htmlFor="id">Номер котла</label>
                <input type="text"
                    id="id"
                    value={data.id}
                    onChange={handleChange}
                    name='id' />
                <label htmlFor="lastchanges">Изменения</label>
                <input type="text"
                    id="lastchanges"
                    name='lastchanges'
                    value={data.lastchanges}
                    onChange={handleChange} />
                <button type='submit' style={{ width: 75, height: 40 }}>Отправить на сервер</button>
            </form>
            {response && (
                <p>
                    {response}
                </p>
            )}
        </>
    )
}