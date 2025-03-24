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
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import $api from "../../../../http";
import EditIcon from "@mui/icons-material/Edit";
import Add from "@mui/icons-material/Add";
import { ThemeContext } from "../../../../Theme";
import DownloadIcon from "@mui/icons-material/Download";
import region_data from "../../../WorkerPanel/DataBaseUsers/russian_regions_codes.json";

export default function OptionsDialog({ open, user, setOptions }) {
  const [userData, setUserData] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState(null);
  const { access_level } = useContext(ThemeContext);
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

  const handleBlurOrEnter = (key) => {
    if (editedValue !== null) {
      const newValue =
        typeof editedValue === "string"
          ? editedValue.trim()
          : key === "full_name"
          ? `${editedValue.surname} ${editedValue.name} ${editedValue.patronymic}`.trim()
          : editedValue;

      handleSaveChanges(key, newValue);
    }
    setEditingField(null);
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
            onClick={() => {
              window.open("/work_contract", "_blank");
            }}
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
              ) : key === "full_name" ? (
                editingField === key ? (
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
    </Dialog>
  );
}
