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
      <strong>Уже чиним!</strong>
      <p>
        <strong>РЕЖИМ РАЗРАБОТКИ</strong>
        <br />
        <i>{error.statusText || error.message}</i>
        <br />
        <strong> РЕЖИМ РАЗРАБОТКИ</strong>
      </p>
      <Link to="/personalaccount">Вернуться назад</Link>
    </div>
  );
}
