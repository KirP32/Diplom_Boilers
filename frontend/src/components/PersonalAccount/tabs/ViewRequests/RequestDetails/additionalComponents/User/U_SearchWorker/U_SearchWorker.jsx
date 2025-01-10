import React from "react";

export default function U_SearchWorker() {
  let find_worker = 0;
  let worker_name = "Test";
  return (
    <div className="search_worker__wrapper">
      <div className="search_worker__wrapper__main_content">
        {find_worker === 0 ? (
          <>
            <section>Ожидаем подтверждения от специалиста</section>
          </>
        ) : (
          <>
            <section>Специалист найден: {worker_name}</section>
          </>
        )}
        <></>
      </div>
    </div>
  );
}
