import Button from "../Button/Button"
import { differences } from "../../data"
import { useState } from "react";


export default function ChooseSection() {
    const [contentType, setContent] = useState('Нажми кнопку');
    function handleClick(type) {
        setContent(type);
    }
    return (
        <section>
            <h3>Кастомный компонент</h3>
            <Button
                isActive={contentType === 'first'}
                onClick={() => handleClick('first')}>Подход</Button>
            <Button
                isActive={contentType === 'second'}
                onClick={() => handleClick('second')}>Доступность</Button>
            <Button
                isActive={contentType === 'third'}
                onClick={() => handleClick('third')}>Дорожная карта</Button>

            <p>{differences[contentType]}</p>
        </section>
    )
}