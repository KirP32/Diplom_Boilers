/* eslint-disable react/prop-types */
import { useCallback, useContext, useEffect } from "react";
import $api from "../../../http";
import { useState } from "react";
import styles from "./WorkerRequests.module.scss";
import { jwtDecode } from "jwt-decode";
import Button from "../../Button/Button";
import OptionsDialog from "../Dialogs/OptionsDialog/OptionsDialog";
import CreateSystemDialog from "../Dialogs/CreateSystemDialog/CreateSystemDialog";
import { ThemeContext } from "../../../Theme";
import RequestDetails from "../tabs/ViewRequests/RequestDetails/RequestDetails";
import AdditionalInfoDialog from "./AdditionalInfoDialog/AdditionalInfoDialog";
import { useNavigate } from "react-router-dom";
// import ToggleButton from "@mui/material/ToggleButton";
// import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
// import TableView from "./TableView";
import ListView from "./ListView";

export default function WorkerRequests({
  systems_names,
  getAllDevices,
  setDeviceFirst,
}) {
  const [availData, setAvailData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [add_failure, setAdd_Failure] = useState(false);
  const [user_name, setUser_name] = useState("");
  const [options_flag, setOptions_flag] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { access_level } = useContext(ThemeContext);

  const [additionalOpen, setAdditionalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const getData = useCallback(async () => {
    const response = await $api.get(`/getRequests/${access_level}`);
    setAvailData(response.data);
  }, []);

  const [detailsObject, setDetailsObject] = useState(null);
  const removeRequest = useCallback(
    async (item) => {
      try {
        await $api.delete(`/removeRequest/${item.id}`);
        await getData();
        await getAllDevices();
        if (
          !availData?.workerDevices.find(
            (object) =>
              object.system_name === item.system_name &&
              object.problem_name !== item.problem_name
          )
        ) {
          setDeviceFirst(item.system_name);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [getData, getAllDevices, availData, setDeviceFirst]
  );

  const addRequest = useCallback(
    async (system_name, id) => {
      setIsProcessing(true);
      try {
        await $api.post("/addRequest", {
          systems_names: systems_names,
          system_name: system_name,
          user: jwtDecode(
            sessionStorage.getItem("accessToken") ||
              localStorage.getItem("accessToken")
          ).login,
          request_id: id,
        });
        await getData();
        await getAllDevices();
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setAdd_Failure(true);
        setTimeout(() => setAdd_Failure(false), 5000);
      } finally {
        setIsProcessing(false);
      }
    },
    [systems_names, getData, getAllDevices]
  );

  useEffect(() => {
    getData();
    const intervalId = setInterval(getData, 120000);

    return () => clearInterval(intervalId);
  }, [getData]);

  useEffect(() => {
    const token =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser_name(decodedToken.login);
      } catch (error) {
        console.error("Ошибка при декодировании токена:", error);
      }
    } else {
      console.log("Токен не найден");
    }
  }, []);
  const [isTableView, setIsTableView] = useState(false);

  const navigate = useNavigate();
  return (
    <div className={styles.worker_requests__wrapper}>
      <div className={styles.indicators__wrapper}>
        <Button
          className={styles.indicators__button}
          style={{ marginLeft: "inherit" }}
          onClick={() => setDialogOpen(true)}
        >
          <h4>Создать систему</h4>
        </Button>
        <section
          style={{
            gap: "30px",
            display: "flex",
          }}
        >
          {access_level === 3 ? (
            <Button
              onClick={() => {
                navigate("/workerPanel");
              }}
              className={styles.button_styles}
            >
              Админ панель
            </Button>
          ) : (
            <></>
          )}

          <Button
            style={{
              backgroundColor:
                access_level === 3
                  ? "hsl(356, 65%, 38%)"
                  : access_level === 2
                  ? "hsl(140, 50%, 45%)"
                  : undefined,
            }}
            className={styles.indicators__button}
            onClick={() => setOptions_flag(!options_flag)}
          >
            <h4>{user_name}</h4>
          </Button>
        </section>
      </div>
      {/* <section
        style={{
          display: "flex",
          justifyContent: "center",
          height: "35px",
          marginBottom: "10px",
        }}
      >
        <ToggleButtonGroup
          value={isTableView}
          exclusive
          onChange={(e, newValue) => {
            if (newValue !== null) setIsTableView(newValue);
          }}
          sx={{
            backgroundColor: "white",
          }}
        >
          <ToggleButton
            value={true}
            sx={{
              color: "black",
              "&.Mui-selected": {
                backgroundColor: "green",
                color: "white",
                "&:hover": {
                  backgroundColor: "darkgreen",
                },
              },
            }}
          >
            Карточки
          </ToggleButton>
          <ToggleButton
            value={false}
            sx={{
              color: "black",
              "&.Mui-selected": {
                backgroundColor: "green",
                color: "white",
                "&:hover": {
                  backgroundColor: "darkgreen",
                },
              },
            }}
          >
            Таблица
          </ToggleButton>
        </ToggleButtonGroup>
      </section> */}

      {/* {isTableView ? (
        <TableView
          availData={availData}
          isProcessing={isProcessing}
          addRequest={addRequest}
          setAdditionalOpen={() => setAdditionalOpen(!additionalOpen)}
          setDetailsObject={(e) => setDetailsObject(e)}
          setCurrentItem={(e) => setCurrentItem(e)}
          removeRequest={(e) => removeRequest(e)}
        />
      ) : (
        <ListView
          availData={availData}
          isProcessing={isProcessing}
          addRequest={addRequest}
          setAdditionalOpen={() => setAdditionalOpen(!additionalOpen)}
          setDetailsObject={(e) => setDetailsObject(e)}
          setCurrentItem={(e) => setCurrentItem(e)}
          removeRequest={(e) => removeRequest(e)}
        />
      )} */}
      <ListView
        availData={availData}
        isProcessing={isProcessing}
        addRequest={addRequest}
        setAdditionalOpen={() => setAdditionalOpen(!additionalOpen)}
        setDetailsObject={(e) => setDetailsObject(e)}
        setCurrentItem={(e) => setCurrentItem(e)}
        removeRequest={(e) => removeRequest(e)}
      />
      {add_failure && (
        <div className={styles.added__failed}>
          <h4>Заявка уже взята в работу</h4>
        </div>
      )}
      {options_flag && (
        <OptionsDialog
          open={options_flag}
          user={{ user_name }}
          setOptions={(e) => setOptions_flag(e)}
        ></OptionsDialog>
      )}

      {isDialogOpen && (
        <CreateSystemDialog
          getAllDevices={getAllDevices}
          open={isDialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      )}

      {currentItem !== null && (
        <AdditionalInfoDialog
          key={currentItem.id}
          open={additionalOpen}
          item={currentItem}
          setAdditionalOpen={() => setAdditionalOpen(false)}
        />
      )}
      {detailsObject !== null && (
        <RequestDetails
          item={detailsObject}
          setItem={(e) => setDetailsObject(e)}
          getAllDevices={() => getAllDevices()}
        />
      )}
    </div>
  );
}
