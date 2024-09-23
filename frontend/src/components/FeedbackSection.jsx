import { useState } from 'react'
import Button from './Button/Button'

export default function FeedbackSection() {
    // const [name, setName] = useState('');
    // const [reason, setReason] = useState('error');
    // const [hasError, setError] = useState(true);
    const [form, setForm] = useState(
        {
            name: '',
            reason: 'error',
            hasError: true,
        }
    )

    function handleNameChange(event) {
        setForm((prev) => (
            {
                ...prev,
                name: event.target.value,
                hasError: event.target.value.trim().length === 0,
            }))
    }

    return (
        <section>
            <h3>Обратная связь</h3>

            <form>
                <label htmlFor="name">Ваше имя</label>
                <input
                    className="control"
                    type="text"
                    id="name"
                    value={form.name}
                    onChange={handleNameChange}
                />

                <label htmlFor="reason">Выберите причину</label>
                <select id="reason" className="control" value={form.reason} onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}>
                    <option value="error">Ошибка</option>
                    <option value="help">Нужна помощь</option>
                    <option value="suggest">Предложениe</option>
                </select>
                <Button
                    disabled={form.hasError}
                    isActive={!form.hasError}
                >Отправить</Button>
                <pre>
                    {JSON.stringify(form, null, 2)}
                </pre>
            </form>
        </section>
    )
}