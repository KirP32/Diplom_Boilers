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
import { useContext, useEffect, useState } from "react";
import $api from "../../../../http";
import EditIcon from "@mui/icons-material/Edit";
import Add from "@mui/icons-material/Add";
import { ThemeContext } from "../../../../Theme";
import DownloadIcon from "@mui/icons-material/Download";
import region_data from "../../../WorkerPanel/DataBaseUsers/russian_regions_codes.json";
import { LoadingSpinner } from "../../../LoadingSpinner/LoadingSpinner";

export default function OptionsDialog({ open, user, setOptions }) {
  const [userData, setUserData] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { access_level } = useContext(ThemeContext);
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
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
        let newValue =
          typeof editedValue === "string"
            ? editedValue.trim()
            : key === "full_name" || key === "contact_person"
            ? `${editedValue.surname} ${editedValue.name} ${editedValue.patronymic}`.trim()
            : editedValue;

        if (key === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(newValue)) {
            if (!snackbarOpen) {
              setErrorMessage("Некорректный email");
              setSnackbarOpen(true);
            }
            return;
          }
        }

        if (key === "inn") {
          if (editedValue.length > 12) {
            setErrorMessage("Некорректный ИНН");
            setSnackbarOpen(true);
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
  const [region_value, setRegion_value] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [servicePrices, setServicePrices] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  async function handleDownloadClick() {
    if (isMobile || navigator.maxTouchPoints > 0) {
      const workerRes = await $api.get("/getWorkerInfo");
      const pricesRes = await $api.get("/getServicePrices");
      setWorkerData(workerRes.data);
      setServicePrices(pricesRes.data);
    } else {
      window.open("/work_contract", "_blank");
    }
  }

  useEffect(() => {
    if ((isMobile || navigator.maxTouchPoints > 0) && pdfUrl) {
      window.location.href = pdfUrl;
    }
  }, [isMobile, pdfUrl]);
  const [isLoading, setIsLoading] = useState(false);
  const [doc_type, setDoc_type] = useState("Устав");
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
        <Button onClick={() => onFinish()} color="info" variant="contained">
          Закрыть
        </Button>
      </DialogActions>
      {(isMobile || navigator.maxTouchPoints > 0) &&
        workerData &&
        servicePrices && (
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
      {
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
            {errorMessage}
          </Alert>
        </Snackbar>
      }
    </Dialog>
  );
}
