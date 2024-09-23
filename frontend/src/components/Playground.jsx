import React, { useState } from 'react';
import Button from './Button/Button';

export default function Playground() {
    const [likes, setLikes] = useState(0);
    const [value, setValue] = useState('');
    function incremet() {
        setLikes(likes + 1)
    }
    function decremet() {
        setLikes(likes - 1)
    }
    return (
        <section>
            <h4>Счётчик {likes}</h4>
            <Button onClick={incremet} >+</Button>
            <Button onClick={decremet}>-</Button>
            <h4>Текстовое поле</h4>
            <input type="text" value={value} onChange={(event) => (setValue(event.target.value))}/>
        </section>
    );
}