import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div>
      <h4>Страница не найдена</h4>
      <Link to="/">Home page</Link>
    </div>
  );
}
