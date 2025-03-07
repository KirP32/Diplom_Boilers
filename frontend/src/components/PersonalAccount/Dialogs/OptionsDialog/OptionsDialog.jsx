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
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import $api from "../../../../http";
import EditIcon from "@mui/icons-material/Edit";
import { ThemeContext } from "../../../../Theme";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "react-router-dom";

export default function OptionsDialog({ open, user, setOptions }) {
  const [userData, setUserData] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState(null);
  const { access_level } = useContext(ThemeContext);
  const navigate = useNavigate();
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
      handleSaveChanges(key, editedValue);
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

  return (
    <Dialog open={open} onClose={() => onFinish()} fullWidth maxWidth="xs">
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
              navigate("/work_contract");
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
              {key === "id" || key === "username" ? (
                <Typography variant="body1">{userData[key]}</Typography>
              ) : editingField === key ? (
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
              ) : (
                <div style={{ display: "flex" }}>
                  <Typography variant="body1">{userData[key]}</Typography>
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
