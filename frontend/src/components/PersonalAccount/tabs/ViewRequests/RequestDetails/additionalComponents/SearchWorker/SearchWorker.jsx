/* eslint-disable react/prop-types */
export default function SearchWorker({ access_level, item }) {
  return (
    <>
      {access_level === 1 ? (
        <div style={{ margin: "auto", fontSize: 25 }}>Это ваша заявка!</div>
      ) : (
        <div
          className="search_worker__wrapper__main_content"
          style={{ margin: "auto", fontSize: 20 }}
        >
          {item.uri_worker_confirmed === false ? (
            <>
              <section>Ожидаем подтверждения от специалиста</section>
            </>
          ) : (
            <>
              <section>
                Специалист найден:
                <span style={{ fontWeight: "bold" }}>
                  {" "}
                  {item.worker_username}
                </span>
              </section>
            </>
          )}
          <></>
        </div>
      )}
    </>
  );
}
