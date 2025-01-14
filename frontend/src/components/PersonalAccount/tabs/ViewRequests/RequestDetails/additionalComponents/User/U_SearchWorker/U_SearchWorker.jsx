import React from "react";

export default function U_SearchWorker({ item }) {
  return (
    <div
      className="search_worker__wrapper__main_content"
      style={{ margin: "auto" }}
    >
      {item.username ? (
        <>
          <section>Ожидаем подтверждения от специалиста</section>
        </>
      ) : (
        <>
          <section>
            Специалист найден:
            <span style={{ fontWeight: "bold" }}> {item.username}</span>
          </section>
        </>
      )}
      <></>
    </div>
  );
}
