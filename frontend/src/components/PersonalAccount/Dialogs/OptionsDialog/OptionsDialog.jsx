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
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { red } from "@mui/material/colors";
const token = "98be28db4ed79229bc269503c6a4d868e628b318";
const requiredFields = [
  "company_name",
  "position",
  "full_name",
  "region",
  "legal_address",
  "inn",
  "kpp",
  "bic",
  "correspondent_account",
  "bank_name",
  "current_account",
  "contact_person",
  "phone_number",
];

export default function OptionsDialog({ open, user, setOptions }) {
  const [userData, setUserData] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success_updated, setSuccess_updated] = useState(false);
  const { access_level } = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState(false);
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
  const can_download =
    userData &&
    requiredFields.every(
      (field) => userData[field] !== null && userData[field] !== ""
    );
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
          if (
            !editedValue.surname ||
            !editedValue.name ||
            !editedValue.patronymic
          ) {
            setErrorMessage("Заполните ФИО!");
            setSnackbarOpen(true);
            return;
          }
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
            console.log("error");
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
          if (key === "bic") {
            getBank_info();
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
    } else if (can_download) {
      window.open("/work_contract", "_blank");
    } else {
      setErrorMessage("Заполните данные профиля");
      setSnackbarOpen(true);
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
              cursor: can_download ? "pointer" : "default",
              color: can_download ? "default" : "gray",
            }}
            onClick={() => handleDownloadClick()}
          />
        )}
      </DialogTitle>
      <DialogContent>
        {userData ? (
          <>
            {access_level === 1 ? (
              <>
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Ваша почта:</strong>
                  </Typography>
                  {editingField === "email" ? (
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        autoFocus
                        variant="outlined"
                        value={editedValue || ""}
                        onBlur={() => handleBlurOrEnter("email")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleBlurOrEnter("email");
                        }}
                        onChange={(e) => setEditedValue(e.target.value)}
                      />
                    </Box>
                  ) : (
                    <div style={{ display: "flex" }}>
                      <Typography variant="body1">
                        {userData.email || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          setEditingField("email");
                          setEditedValue(userData.email);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>

                {/* phone_number*/}
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Номер телефона:</strong>
                  </Typography>
                  {editingField === "phone_number" ? (
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        autoFocus
                        variant="outlined"
                        value={editedValue || ""}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleBlurOrEnter("phone_number");
                        }}
                        onBlur={() => handleBlurOrEnter("phone_number")}
                        onChange={(e) => setEditedValue(e.target.value)}
                      />
                    </Box>
                  ) : (
                    <div style={{ display: "flex" }}>
                      <Typography variant="body1">
                        {userData.phone_number || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          setEditingField("phone_number");
                          setEditedValue(userData.phone_number);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>

                {/* inn */}

                <Box display="flex" alignItems="center" gap={1}>
                  <PriorityHighIcon sx={{ color: "red" }} />
                  <Typography variant="h6">
                    Введите ИНН вашей компании, постараемся заполнить данные за
                    вас:
                  </Typography>
                </Box>
                <Box mb={2}>
                  {editingField === "inn" ? (
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        autoFocus
                        variant="outlined"
                        value={editedValue || ""}
                        onChange={(e) => setEditedValue(e.target.value)}
                      />
                      <IconButton
                        color="success"
                        onClick={() => {
                          getCompany_info();
                          handleBlurOrEnter("inn");
                        }}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  ) : (
                    <div style={{ display: "flex" }}>
                      <Typography variant="body1">
                        {userData.inn || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          setEditingField("inn");
                          setEditedValue(userData.inn);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>

                {/* company_name */}
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Название организации:</strong>
                  </Typography>
                  {editingField === "company_name" ? (
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        autoFocus
                        variant="outlined"
                        value={editedValue || ""}
                        onBlur={() => handleBlurOrEnter("company_name")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleBlurOrEnter("company_name");
                        }}
                        onChange={(e) => setEditedValue(e.target.value)}
                      />
                    </Box>
                  ) : (
                    <div style={{ display: "flex" }}>
                      <Typography variant="body1">
                        {userData.company_name || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          setEditingField("company_name");
                          setEditedValue(userData.company_name);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>

                {/* Поля с ФИО */}
                {/* full_name */}
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>ФИО подписанта:</strong>
                  </Typography>
                  {editingField === "full_name" ? (
                    <Box display="flex" gap={1}>
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
                      <IconButton
                        color="success"
                        onClick={() => handleBlurOrEnter("full_name")}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body1">
                        {userData.full_name || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          const [surname, name, patronymic] =
                            userData.full_name?.split(" ") || ["", "", ""];
                          setEditingField("full_name");
                          setEditedValue({ surname, name, patronymic });
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>

                {/* position */}
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Должность подписанта:</strong>
                  </Typography>
                  {editingField === "position" ? (
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        autoFocus
                        onBlur={() => handleBlurOrEnter("position")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleBlurOrEnter("position");
                        }}
                        variant="outlined"
                        value={editedValue || ""}
                        onChange={(e) => setEditedValue(e.target.value)}
                      />
                    </Box>
                  ) : (
                    <div style={{ display: "flex" }}>
                      <Typography variant="body1">
                        {userData.position || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          setEditingField("position");
                          setEditedValue(userData.position);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>

                {/* legal_address */}
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Юридический адрес:</strong>
                  </Typography>
                  {editingField === "legal_address" ? (
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
                          onBlur={() => handleBlurOrEnter("legal_address")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleBlurOrEnter("legal_address");
                          }}
                        />
                      )}
                    />
                  ) : (
                    <div style={{ display: "flex" }}>
                      <Typography variant="body1">
                        {userData.legal_address || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          setEditingField("legal_address");
                          setEditedValue(userData.legal_address);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>
                {/* kpp*/}
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>КПП организации:</strong>
                  </Typography>
                  <div style={{ display: "flex" }}>
                    <Typography variant="body1">
                      {userData.kpp || "—"}
                    </Typography>
                    <IconButton
                      onClick={() => {
                        setEditingField("kpp");
                        setEditedValue(userData.kpp);
                      }}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </div>
                  <Divider sx={{ my: 1 }} />
                </Box>
                {/* bic */}

                <Box display="flex" alignItems="center" gap={1}>
                  <PriorityHighIcon sx={{ color: "red" }} />
                  <Typography variant="h6">
                    Введите БИК вашего банка, постараемся заполнить данные за
                    вас:
                  </Typography>
                </Box>
                <Box mb={2}>
                  {editingField === "bic" ? (
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        autoFocus
                        variant="outlined"
                        value={editedValue || ""}
                        onChange={(e) => setEditedValue(e.target.value)}
                      />
                      <IconButton
                        color="success"
                        onClick={() => {
                          handleBlurOrEnter("bic");
                        }}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  ) : (
                    <div style={{ display: "flex" }}>
                      <Typography variant="body1">
                        {userData.bic || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          setEditingField("bic");
                          setEditedValue(userData.bic);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>

                {/* bank_name */}
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Название вашего банка:</strong>
                  </Typography>
                  {editingField === "bank_name" ? (
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        autoFocus
                        variant="outlined"
                        onBlur={() => handleBlurOrEnter("bank_name")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleBlurOrEnter("bank_name");
                        }}
                        value={editedValue || ""}
                        onChange={(e) => setEditedValue(e.target.value)}
                      />
                    </Box>
                  ) : (
                    <div style={{ display: "flex" }}>
                      <Typography variant="body1">
                        {userData.bank_name || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          setEditingField("bank_name");
                          setEditedValue(userData.bank_name);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>

                {/* correspondent_account */}
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Корреспондентский счёт:</strong>
                  </Typography>
                  {editingField === "correspondent_account" ? (
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        autoFocus
                        variant="outlined"
                        onBlur={() =>
                          handleBlurOrEnter("correspondent_account")
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleBlurOrEnter("correspondent_account");
                        }}
                        value={editedValue || ""}
                        onChange={(e) => setEditedValue(e.target.value)}
                      />
                    </Box>
                  ) : (
                    <div style={{ display: "flex" }}>
                      <Typography variant="body1">
                        {userData.correspondent_account || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          setEditingField("correspondent_account");
                          setEditedValue(userData.correspondent_account);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>
                {/* current_account */}
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Расчётный счёт:</strong>
                  </Typography>
                  {editingField === "current_account" ? (
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        autoFocus
                        variant="outlined"
                        value={editedValue || ""}
                        onBlur={() => handleBlurOrEnter("current_account")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleBlurOrEnter("current_account");
                        }}
                        onChange={(e) => setEditedValue(e.target.value)}
                      />
                    </Box>
                  ) : (
                    <div style={{ display: "flex" }}>
                      <Typography variant="body1">
                        {userData.current_account || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          setEditingField("current_account");
                          setEditedValue(userData.current_account);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>

                {/* contact_person */}
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Контактное лицо:</strong>
                  </Typography>
                  {editingField === "contact_person" ? (
                    <Box display="flex" gap={1}>
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
                      <IconButton
                        color="success"
                        onClick={() => handleBlurOrEnter("contact_person")}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body1">
                        {userData.contact_person || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          const [surname, name, patronymic] =
                            userData.contact_person?.split(" ") || ["", "", ""];
                          setEditingField("contact_person");
                          setEditedValue({ surname, name, patronymic });
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>

                {/* auth_doct_type */}
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Тип документа, дающего право подписи:</strong>
                  </Typography>
                  {editingField === "auth_doct_type" ? (
                    <FormControl size="medium" sx={{ width: "100%" }}>
                      <Select
                        value={userData.auth_doct_type}
                        labelId="doc_type_label"
                        label="Документ"
                        onChange={(e) => {
                          handleSaveChanges("auth_doct_type", e.target.value);
                          setEditingField(null);
                        }}
                        onBlur={() => handleBlurOrEnter("auth_doct_type")}
                        fullWidth
                      >
                        <MenuItem value="Устав">Устав</MenuItem>
                        <MenuItem value="ГПХ">ГПХ</MenuItem>
                        <MenuItem value="Договор">Договор</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <div style={{ display: "flex" }}>
                      <Typography variant="body1">
                        {userData.auth_doct_type || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => setEditingField("auth_doct_type")}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>

                {/* region */}
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Ваш регион:</strong>
                  </Typography>
                  {editingField === "region" ? (
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
                          onBlur={() => handleBlurOrEnter("region")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleBlurOrEnter("region");
                          }}
                        />
                      )}
                      freeSolo
                    />
                  ) : (
                    <div style={{ display: "flex" }}>
                      <Typography variant="body1">
                        {region_data.find(
                          (r) => r.code === Number(userData.region)
                        )?.name || userData.region}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          setEditingField("region");
                          setEditedValue(userData.region);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>

                {/* Остальные поля */}
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Номер договора:</strong>
                  </Typography>
                  <div style={{ display: "flex" }}>
                    <Typography variant="body1">
                      {userData.contract_number || "—"}
                    </Typography>
                    <IconButton
                      onClick={() => {
                        setEditingField("contract_number");
                        setEditedValue(userData.contract_number);
                      }}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </div>
                  <Divider sx={{ my: 1 }} />
                </Box>

                {/* Доступы */}
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>
                      Доступ к котлам МВ 3.1 мощностью 127-301 кВт:
                    </strong>
                  </Typography>
                  <Typography variant="body1">
                    {userData.service_access_3_1_127_301
                      ? "Есть доступ"
                      : "Нет доступа"}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                </Box>
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>
                      Доступ к котлам МВ 3.1 мощностью 400-2000 кВт:
                    </strong>
                  </Typography>
                  <Typography variant="body1">
                    {userData.service_access_3_1_400_2000
                      ? "Есть доступ"
                      : "Нет доступа"}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                </Box>
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Доступ к котлам МВ 4.1 мощностью 40-99 кВт</strong>
                  </Typography>
                  <Typography variant="body1">
                    {userData.service_access_4_1
                      ? "Есть доступ"
                      : "Нет доступа"}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                </Box>
              </>
            ) : access_level === 0 || access_level === 2 ? (
              <>
                {/* full_name */}
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Ваше ФИО:</strong>
                  </Typography>
                  {editingField === "full_name" ? (
                    <Box display="flex" gap={1}>
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
                      <IconButton
                        color="success"
                        onClick={() => handleBlurOrEnter("full_name")}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body1">
                        {userData.full_name || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          const [surname, name, patronymic] =
                            userData.full_name?.split(" ") || ["", "", ""];
                          setEditingField("full_name");
                          setEditedValue({ surname, name, patronymic });
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Ваш адрес:</strong>
                  </Typography>
                  {editingField === "legal_address" ? (
                    <Autocomplete
                      freeSolo
                      value={editedValue ?? ""}
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
                          onBlur={() => handleBlurOrEnter("legal_address")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleBlurOrEnter("legal_address");
                          }}
                        />
                      )}
                    />
                  ) : (
                    <div style={{ display: "flex" }}>
                      <Typography variant="body1">
                        {userData.legal_address || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          setEditingField("legal_address");
                          setEditedValue(userData.legal_address);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>
              </>
            ) : (
              <>
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Ваше ФИО:</strong>
                  </Typography>
                  {editingField === "full_name" ? (
                    <Box display="flex" gap={1}>
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
                      <IconButton
                        color="success"
                        onClick={() => handleBlurOrEnter("full_name")}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body1">
                        {userData.full_name || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          const [surname, name, patronymic] =
                            userData.full_name?.split(" ") || ["", "", ""];
                          setEditingField("full_name");
                          setEditedValue({ surname, name, patronymic });
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>
                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                  >
                    <strong>Ваш адрес:</strong>
                  </Typography>
                  {editingField === "legal_address" ? (
                    <Autocomplete
                      freeSolo
                      value={editedValue ?? ""}
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
                          onBlur={() => handleBlurOrEnter("legal_address")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleBlurOrEnter("legal_address");
                          }}
                        />
                      )}
                    />
                  ) : (
                    <div style={{ display: "flex" }}>
                      <Typography variant="body1">
                        {userData.legal_address || "—"}
                      </Typography>
                      <IconButton
                        onClick={() => {
                          setEditingField("legal_address");
                          setEditedValue(userData.legal_address);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Box>
              </>
            )}
          </>
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
