import { useEffect, useState } from 'react';
import viteLogo from '../assets/react.svg'


export default function Header() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => {
            clearInterval(interval);
        }
    }, []);

    return (
        <header>
            <img src={viteLogo} alt="" className='header__logo' />
            <h3>Geffet boiler</h3>
            <span>Время: {now.toLocaleTimeString()} </span>
        </header>
    )
}