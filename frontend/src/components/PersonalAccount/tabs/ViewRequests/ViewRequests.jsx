/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState, useMemo } from "react";
import styles from "./ViewRequests.module.scss";
import $api from "../../../../http";
import RequestDetails from "./RequestDetails/RequestDetails";
import { jwtDecode } from "jwt-decode";
import DeleteDialog from "./DeleteDialog/DeleteDialog";
import { SystemProvider } from "../../Functions/ContextGetSystems";

export default function ViewRequests({ deviceObject, getAllDevices }) {
  const [data, setData] = useState(null);
  const [showDialog, setShowDialog] = useState({
    flag: false,
    item: {},
  });
  const [filters, setFilters] = useState({
    available: false,
    inProgress: true,
    completed: false,
  });
  const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      setDecodedToken(token ? jwtDecode(token) : null);
    } catch (error) {
      console.error("Ошибка декодирования токена:", error);
      setDecodedToken(null);
    }
  }, []);

  const [item, setItem] = useState(null);
  const getSystems = useCallback(async () => {
    try {
      const result = await $api.get("/getSystemRequests", {
        params: { name: deviceObject.name },
      });
      setData(result.data);
    } catch (error) {
      console.error(error);
    }
  }, [deviceObject.name]);

  useEffect(() => {
    getSystems();
  }, [getSystems, deviceObject.name]);

  useEffect(() => {
    if (data && item) {
      const updatedItem = data.find((i) => i.id === item.id);
      if (updatedItem) {
        if (!updatedItem.system_name) {
          setItem(null);
        } else {
          setItem(updatedItem);
        }
      }
    }
  }, [data, item]);

  function handleCheckboxChange(param) {
    setFilters((prev) => ({ ...prev, [param]: !prev[param] }));
  }

  function doNothing() {}

  const filteredData = useMemo(() => {
    let filtered = [];
    if (data && data.length > 0) {
      if (filters.inProgress) {
        filtered = filtered.concat(data.filter((item) => item.status === 0));
      }
      if (filters.completed) {
        filtered = filtered.concat(data.filter((item) => item.status === 1));
      }
    }
    return filtered;
  }, [data, filters.inProgress, filters.completed]);

  const handleCardClick = (item) => {
    setItem(item);
  };

  return (
    // <SystemProvider> // проверял контекст
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
              style={{ overflow: "hidden" }}
              key={item.id}
              onClick={
                decodedToken?.access_level === 0 ||
                decodedToken?.access_level === 2 ||
                decodedToken?.access_level === 3 ||
                item.assigned_to == decodedToken?.userID
                  ? () => handleCardClick(item)
                  : null
              }
            >
              <h5>{item.problem_name}</h5>
              <div
                className={styles.status_wrapper}
                style={{ maxWidth: "166px" }}
              >
                <span
                  className={`${
                    item.status === 0 ? styles.inProgress : styles.completed
                  } ${styles.status_badge}`}
                >
                  {item.status === 0 ? "В работе" : "Завершено"}
                </span>
                {item.status != 1 && (
                  <span
                    className={`material-icons ${styles.no_select}`}
                    style={{ color: "red" }}
                    onClick={(e) => {
                      setShowDialog({ flag: true, item: item });
                      e.stopPropagation();
                    }}
                  >
                    cancel
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <></>
        )}
      </div>
      {item && !showDialog.flag && item.system_name && (
        <RequestDetails
          item={item} // передаём минимум информации для работы компонента
          setItem={(e) => setItem(e)}
          getAllDevices={getAllDevices}
        />
      )}

      {showDialog.flag && (
        <DeleteDialog
          showDialog={showDialog}
          setOpen={(e) => setShowDialog({ flag: e })}
          getSystems={() => getSystems()}
        />
      )}
    </div>
    // </SystemProvider>
  );
}
