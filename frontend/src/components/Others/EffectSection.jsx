import { useEffect, useState, useCallback, Fragment } from "react";
import Button from "../Button/Button";
import Modal from "../Modal/Modal";

export default function EffectSection() {
    const [modal, setModel] = useState(false)
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const users = await response.json();
        setUsers(users);
        setLoading(false);
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    function InputHandler(event) {
        setInputValue(event.target.value)
    }
    return (
        <section>
            <h3>Effects</h3>

            <Button
                onClick={() => { setModel(true) }}
            >Открыть информацию</Button>

            <Modal open={modal}>
                <h3>Hello modal</h3>
                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Molestias consequuntur facere aliquid voluptate officia voluptas, laudantium ut magnam tempora at. Distinctio minima eius animi tenetur?</p>
                <Button onClick={() => setModel(false)}>Закрыть</Button>
            </Modal>

            {loading && <>
                <p>Loading...</p>
            </>}
            {!loading && (
                <Fragment>
                    <input type="text" className="control" value={inputValue} onChange={InputHandler} />
                    <ul>
                        {users
                            .filter((user) => user.name.toLowerCase().includes(inputValue.toLowerCase()))
                            .map((user) => (
                                <li key={user.id}>{user.name}</li>
                            ))}
                    </ul>
                </Fragment>
            )}
        </section>
    )
}
