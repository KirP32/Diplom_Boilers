/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Divider,
  Button,
  IconButton,
  TextField,
  Autocomplete,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { MyDocument } from "./WorkerContract/WorkerContract";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useContext, useEffect, useRef, useState } from "react";
import $api from "../../../../http";
import EditIcon from "@mui/icons-material/Edit";
import Add from "@mui/icons-material/Add";
import { ThemeContext } from "../../../../Theme";
import DownloadIcon from "@mui/icons-material/Download";
import region_data from "../../../WorkerPanel/DataBaseUsers/russian_regions_codes.json";
import { LoadingSpinner } from "../../../LoadingSpinner/LoadingSpinner";
import axios from "axios";
const token = "98be28db4ed79229bc269503c6a4d868e628b318";

export default function OptionsDialog({ open, user, setOptions }) {
  const [userData, setUserData] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success_updated, setSuccess_updated] = useState(false);
  const { access_level } = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState(false);
  const [doc_type, setDoc_type] = useState("Устав");
  const debounceRef = useRef(null);
  const [address_list, setAddressList] = useState([]);
  const [region_value, setRegion_value] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [servicePrices, setServicePrices] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const canTouch = navigator.maxTouchPoints > 0;

  const handleSaveChanges = (key, newValue) => {
    $api
      .put("/updateUser", { key, newValue, access_level })
      .then(() => {
        setUserData((prev) => ({
          ...prev,
          [key]: newValue,
        }));
        setEditingField(null);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  let debounceTimer;
  const handleBlurOrEnter = (key) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (editedValue !== null) {
        let newValue;
        if (key === "legal_address") {
          const selectedAddress = address_list.find(
            (item) => item.label === editedValue
          );
          newValue = selectedAddress
            ? selectedAddress.unrestricted_value
            : editedValue;
        } else if (typeof editedValue === "string") {
          newValue = editedValue.trim();
        } else if (key === "full_name" || key === "contact_person") {
          newValue =
            `${editedValue.surname} ${editedValue.name} ${editedValue.patronymic}`.trim();
        } else {
          newValue = editedValue;
        }
        if (key === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(newValue)) {
            setErrorMessage("Некорректный email");
            setSnackbarOpen(true);
            setSuccess_updated(false);
            return;
          }
        }

        if (key === "inn") {
          if (
            editedValue.length < 10 ||
            editedValue.length > 12 ||
            /^\d+$/.test(editedValue) === false
          ) {
            setErrorMessage("Некорректный ИНН");
            setSnackbarOpen(true);
            setSuccess_updated(false);
            return;
          }
        }
        if (key === "kpp" || key === "bic") {
          if (editedValue.length !== 9 || /^\d+$/.test(editedValue) === false) {
            if (key === "kpp") {
              setErrorMessage("Некорректный КПП (9 цифр)");
            } else {
              setErrorMessage("Некорректный БИК (9 цифр)");
            }
            setSnackbarOpen(true);
            setSuccess_updated(false);
            return;
          }
        }
        if (key === "current_account" || key === "correspondent_account") {
          if (
            editedValue.length !== 20 ||
            /^\d+$/.test(editedValue) === false
          ) {
            if (key === "current_account") {
              setErrorMessage("Некорректный Расчётный счёт (20 цифр)");
            } else {
              setErrorMessage("Некорректный Корреспондентский счет (20 цифр)");
            }
            setSnackbarOpen(true);
            setSuccess_updated(false);
            return;
          }
        }

        handleSaveChanges(key, newValue);
      }
      setEditingField(null);
    }, 150);
  };

  useEffect(() => {
    if (open) {
      $api
        .post("/getUser_email", { access_level })
        .then((result) => {
          setUserData(result?.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [open]);

  function onFinish() {
    setOptions(false);
  }

  const defaultProps = {
    options: region_data,
    getOptionLabel: (option) => option.name,
  };
  async function handleDownloadClick() {
    if (isMobile || canTouch) {
      const workerRes = await $api.get("/getWorkerInfo");
      const pricesRes = await $api.get("/getServicePrices");
      setWorkerData(workerRes.data);
      setServicePrices(pricesRes.data);
    } else {
      window.open("/work_contract", "_blank");
    }
  }

  useEffect(() => {
    if ((isMobile || canTouch) && pdfUrl) {
      window.location.href = pdfUrl;
    }
  }, [isMobile, pdfUrl, canTouch]);

  async function handleLegalAddress(query) {
    try {
      const result = await axios({
        method: "POST",
        url: "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${token}`,
        },
        data: { query, count: 7 },
      });
      let temp_list = [];
      result.data.suggestions.forEach((item) =>
        temp_list.push({
          label: item.value,
          unrestricted_value: item.unrestricted_value,
        })
      );
      setAddressList(temp_list);
    } catch (error) {
      console.log(error.response ? error.response.data : error);
    }
  }

  function handleInputChange(newInputValue) {
    if (newInputValue !== editedValue) {
      setEditedValue(newInputValue);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        handleLegalAddress(newInputValue);
      }, 500);
    }
  }

  function handleChange(event, newValue) {
    if (newValue && typeof newValue === "string") {
      setEditedValue(newValue);
    }
  }

  async function getCompany_info() {
    try {
      const result = await axios({
        method: "POST",
        url: "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${token}`,
        },
        data: {
          query: editedValue.toLowerCase().replace(/["']/g, ""),
          count: 1,
        },
      });
      setUserData({
        ...userData,
        company_name: result.data.suggestions[0].value,
        position: result.data.suggestions[0].data.management.post,
        full_name: result.data.suggestions[0].data.management.name,
        legal_address:
          result.data.suggestions[0].data.address.unrestricted_value,
        inn: result.data.suggestions[0].data.inn,
        kpp: result.data.suggestions[0].data.kpp,
      });
    } catch (error) {
      console.log(error.response ? error.response.data : error);
    }
  }

  const handleConfirmData = async () => {
    try {
      await $api.post("/WorkerConfirmedData", userData);
      setErrorMessage("");
      setSnackbarOpen(true);
      setSuccess_updated(true);
    } catch (error) {
      setSuccess_updated(false);
      setErrorMessage("Ошибка подтверждения данных");
      setSnackbarOpen(true);
    }
  };

  const getBank_info = async () => {
    try {
      const result = await axios({
        method: "POST",
        url: "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/bank",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${token}`,
        },
        data: {
          query: editedValue.toLowerCase().trim().replace("-", ""),
          count: 1,
        },
      });

      setUserData({
        ...userData,
        correspondent_account:
          result.data.suggestions[0].data.correspondent_account,
        bank_name: result.data.suggestions[0].unrestricted_value,
        bic: result.data.suggestions[0].data.bic,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={open} onClose={() => onFinish()} fullWidth maxWidth="md">
      <DialogTitle
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}
      >
        <span
          style={{
            gridColumn: 2,
            textAlign: "center",
            fontSize: "28px",
            fontWeight: "bold",
          }}
        >
          {user.user_name}
        </span>

        {access_level === 1 && (
          <DownloadIcon
            style={{
              alignSelf: "center",
              marginLeft: "auto",
              cursor: "pointer",
            }}
            onClick={() => handleDownloadClick()}
          />
        )}
      </DialogTitle>
      <DialogContent>
        {userData ? (
          Object.keys(userData).map((key) => (
            <Box key={key} mb={2}>
              <Typography variant="body2" color="textSecondary" component="div">
                <strong>{key}:</strong>
              </Typography>
              {key === "id" ||
              key === "username" ||
              [
                "service_access_3_1_127_301",
                "service_access_4_1",
                "service_access_3_1_400_2000",
              ].includes(key) ? (
                <Typography variant="body1">
                  {typeof userData[key] === "boolean"
                    ? userData[key]
                      ? "Есть доступ"
                      : "Нет доступа"
                    : userData[key]}
                </Typography>
              ) : key === "full_name" || key === "contact_person" ? (
                editingField === key ? (
                  <Box display="flex" gap={1}>
                    {key === "contact_person" ? (
                      <>
                        <TextField
                          autoFocus
                          fullWidth
                          variant="outlined"
                          placeholder="Фамилия"
                          value={editedValue?.surname || ""}
                          onChange={(e) =>
                            setEditedValue((prev) => ({
                              ...prev,
                              surname: e.target.value,
                            }))
                          }
                        />
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Имя"
                          value={editedValue?.name || ""}
                          onChange={(e) =>
                            setEditedValue((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Отчество"
                          value={editedValue?.patronymic || ""}
                          onChange={(e) =>
                            setEditedValue((prev) => ({
                              ...prev,
                              patronymic: e.target.value,
                            }))
                          }
                        />
                      </>
                    ) : (
                      <>
                        <TextField
                          autoFocus
                          fullWidth
                          variant="outlined"
                          placeholder="Фамилия"
                          value={editedValue?.surname || ""}
                          onChange={(e) =>
                            setEditedValue((prev) => ({
                              ...prev,
                              surname: e.target.value,
                            }))
                          }
                        />
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Имя"
                          value={editedValue?.name || ""}
                          onChange={(e) =>
                            setEditedValue((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Отчество"
                          value={editedValue?.patronymic || ""}
                          onChange={(e) =>
                            setEditedValue((prev) => ({
                              ...prev,
                              patronymic: e.target.value,
                            }))
                          }
                        />
                      </>
                    )}
                    <IconButton
                      color="success"
                      onClick={() => handleBlurOrEnter(key)}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                ) : (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body1">
                      {userData[key] ? userData[key] : "—"}
                    </Typography>
                    <IconButton
                      onClick={() => {
                        const [surname, name, patronymic] = userData[
                          key
                        ]?.split(" ") || ["", "", ""];
                        setEditingField(key);
                        setEditedValue({ surname, name, patronymic });
                      }}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </div>
                )
              ) : editingField === key ? (
                key === "region" ? (
                  <Autocomplete
                    {...defaultProps}
                    value={region_value}
                    onChange={(event, newValue) => {
                      setRegion_value(newValue);
                      setEditedValue(newValue ? newValue.code : "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        onBlur={() => handleBlurOrEnter(key)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleBlurOrEnter(key);
                          }
                        }}
                      />
                    )}
                    freeSolo
                  />
                ) : key === "auth_doct_type" ? (
                  <FormControl size="medium" sx={{ width: "100%" }}>
                    <Select
                      value={doc_type}
                      labelId="doc_type_label"
                      label="Документ"
                      onChange={(e) => {
                        setDoc_type(e.target.value);
                        handleSaveChanges(key, e.target.value);
                        setEditingField(null);
                      }}
                      onBlur={() => handleBlurOrEnter(key)}
                      fullWidth
                    >
                      <MenuItem value={"Устав"}>Устав</MenuItem>
                      <MenuItem value={"ГПХ"}>ГПХ</MenuItem>
                      <MenuItem value={"Договор"}>Договор</MenuItem>
                    </Select>
                  </FormControl>
                ) : key === "legal_address" ? (
                  <Autocomplete
                    freeSolo
                    value={editedValue}
                    options={address_list}
                    filterOptions={(options) => options}
                    onInputChange={(event, newInputValue) =>
                      handleInputChange(newInputValue)
                    }
                    onChange={(event, newValue) =>
                      handleChange(event, newValue)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        autoFocus
                        onBlur={() => handleBlurOrEnter(key)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleBlurOrEnter(key);
                          }
                        }}
                      />
                    )}
                  />
                ) : key === "company_name" ? (
                  <Box display="flex" gap={1}>
                    <TextField
                      fullWidth
                      autoFocus
                      variant="outlined"
                      value={editedValue}
                      onChange={(e) => setEditedValue(e.target.value)}
                    />
                    <IconButton
                      color="success"
                      onClick={() => {
                        getCompany_info();
                        handleBlurOrEnter(key);
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                ) : key === "bank_name" ? (
                  <Box display="flex" gap={1}>
                    <TextField
                      fullWidth
                      autoFocus
                      variant="outlined"
                      value={editedValue}
                      onChange={(e) => setEditedValue(e.target.value)}
                    />
                    <IconButton
                      color="success"
                      onClick={() => {
                        getBank_info();
                        handleBlurOrEnter(key);
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                ) : (
                  <TextField
                    autoFocus
                    fullWidth
                    variant="outlined"
                    value={
                      editedValue !== null ? editedValue : userData[key] || ""
                    }
                    onChange={(e) => setEditedValue(e.target.value)}
                    onBlur={() => handleBlurOrEnter(key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleBlurOrEnter(key);
                      }
                    }}
                  />
                )
              ) : (
                <div style={{ display: "flex" }}>
                  <Typography variant="body1">
                    {key === "region"
                      ? region_data.find(
                          (r) => r.code === Number(userData[key])
                        )?.name || userData[key]
                      : userData[key]}
                  </Typography>
                  <IconButton
                    onClick={() => {
                      setEditingField(key);
                      setEditedValue(userData[key]);
                    }}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </div>
              )}
              <Divider sx={{ my: 1 }} />
            </Box>
          ))
        ) : (
          <Typography variant="body2">Загрузка данных...</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => handleConfirmData()}
          color="success"
          variant="contained"
          disabled={editingField ? true : false}
        >
          Подтвердить данные
        </Button>
        <Button onClick={() => onFinish()} color="info" variant="contained">
          Закрыть
        </Button>
      </DialogActions>
      {(isMobile || canTouch) && workerData && servicePrices && (
        <div style={{ display: "none" }}>
          <PDFDownloadLink
            document={
              <MyDocument
                data={workerData}
                dataPrices={servicePrices}
                handleOnLoad={() => {}}
              />
            }
            fileName="contract.pdf"
          >
            {({ loading, url }) => {
              if (loading) {
                setIsLoading(true);
              } else {
                setIsLoading(false);
                if (!loading && url && !pdfUrl) {
                  setPdfUrl(url);
                }
              }
              return null;
            }}
          </PDFDownloadLink>
        </div>
      )}
      {isLoading && <LoadingSpinner />}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => {
          setSnackbarOpen(false);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={success_updated ? "success" : "error"}
          onClose={() => {
            setSnackbarOpen(false);
          }}
        >
          {success_updated ? "Данные обновлены" : errorMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
