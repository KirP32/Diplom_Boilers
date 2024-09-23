import { ways } from '../data.js';
import ReactiveList from './ReactiveList.jsx';


export default function MainSection() {
    return (
        <section>
            <h3>Реактивное меню</h3>
            <ul>
                {ways.map((item, index) => (
                    <ReactiveList key={index} {...item} />
                ))}
            </ul>
        </section>
    )
}