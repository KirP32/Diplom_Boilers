import React from "react";

export default function U_SearchWorker({ item }) {
  return (
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
            <span style={{ fontWeight: "bold" }}> {item.worker_username}</span>
          </section>
        </>
      )}
      <></>
    </div>
  );
}
