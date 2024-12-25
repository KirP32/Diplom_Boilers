import React, { useEffect, useState } from "react";
import styles from "./ViewRequests.module.scss";
import $api from "../../../../http";
import RequestDetails from "./RequestDetails/RequestDetails";

export default function ViewRequests({ deviceObject }) {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    available: false,
    inProgress: true,
    completed: false,
  });

  const [item, setItem] = useState(null);

  useEffect(() => {
    $api
      .get("/getSystemRequests", { params: { name: deviceObject.name } })
      .then((result) => {
        setData(result.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  function handleCheckboxChange(param) {
    setFilters((prevFilter) => {
      return {
        ...filters,
        [param]: !prevFilter[param],
      };
    });
  }

  function getFilteredData() {
    const filtered = [];
    if (data !== null) {
      if (filters.inProgress) {
        data.forEach((item) => {
          if (item.status === 0) {
            filtered.push(item);
          }
        });
      }
      if (filters.completed) {
        data.forEach((item) => {
          if (item.status === 1) {
            filtered.push(item);
          }
        });
      }
      return filtered;
    }
  }

  function doNothing() {}
  const filteredData = getFilteredData();

  const handleCardClick = (item) => {
    // navigate(`/personalaccount/request/${id}`);
    setItem(item);
  };

  return (
    <div className={styles.view_requests_wrapper}>
      <div className={styles.requests__filter}>
        <section
          className={styles.filter__section}
          onClick={(e) => {
            handleCheckboxChange("inProgress");
          }}
        >
          <input
            type="checkbox"
            checked={filters.inProgress}
            onChange={doNothing}
          />
          <h4>В работе</h4>
        </section>
        <section
          className={styles.filter__section}
          onClick={(e) => {
            handleCheckboxChange("completed");
          }}
        >
          <input
            type="checkbox"
            checked={filters.completed}
            onChange={doNothing}
          />
          <h4>Завершённые</h4>
        </section>
      </div>
      <div className={styles.requests}>
        {data !== null && filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div
              className={styles.request_card}
              key={item.id}
              onClick={() => handleCardClick(item)}
            >
              <h5>{item.problem_name}</h5>
              <span
                className={`${
                  item.status === 0 ? styles.inProgress : styles.completed
                } ${styles.status_badge}`}
              >
                {item.status === 0 ? "В работе" : "Завершено"}
              </span>
            </div>
          ))
        ) : (
          <></>
        )}
      </div>
      {item && <RequestDetails item={item} setItem={(e) => setItem(e)} />}
    </div>
  );
}
