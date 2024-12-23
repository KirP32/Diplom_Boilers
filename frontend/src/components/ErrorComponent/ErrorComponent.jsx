import { Link, useRouteError } from "react-router-dom";

export default function ErrorComponent() {
  const error = useRouteError();
  console.error(error);

  return (
    <div
      className="error-page"
      style={{ textAlign: "center", height: "100%", paddingTop: "15%" }}
    >
      <h1>Ой-ой!</h1>
      <p>Извините, произошла непредвиденная ошибка</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
      <Link to="/personalaccount">Вернуться назад</Link>
    </div>
  );
}
