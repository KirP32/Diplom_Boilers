import { Link } from "react-router-dom"

export default function NotFoundPage() {
    return (
        <div>Страница не найдена
            <Link to="/">Home page</Link>
        </div>
    )
}