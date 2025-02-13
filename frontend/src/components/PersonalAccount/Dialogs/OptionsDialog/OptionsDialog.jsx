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
  InputAdornment,
  IconButton,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import $api from "../../../../http";
import EditIcon from "@mui/icons-material/Edit";

export default function OptionsDialog({ open, user, setOptions }) {
  const [userData, setUserData] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState(null);

  const handleSaveChanges = (key, newValue) => {
    console.log(`Sending updated ${key} with value: ${newValue}`);
    // $api.put("/updateUser", { key, newValue }).then(response => {
    //   console.log(response);
    //   // Тут можно обработать успешный ответ
    // }).catch(error => {
    //   console.log(error);
    //   // Тут можно обработать ошибку
    // });
  };

  const handleBlurOrEnter = (key) => {
    if (editedValue !== null) {
      handleSaveChanges(key, editedValue);
    }
    setEditingField(null);
  };

  useEffect(() => {
    $api
      .post("/getUser_email")
      .then((result) => {
        setUserData(result?.data[0]);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  function onFinish() {
    setOptions(false);
  }

  return (
    <Dialog open={open} onClose={() => onFinish()} fullWidth maxWidth="md">
      <DialogTitle style={{ textAlign: "center" }}>
        {user.user_name}
      </DialogTitle>
      <DialogContent>
        {userData ? (
          Object.keys(userData).map((key) => (
            <Box key={key} mb={2}>
              <Typography variant="body2" color="textSecondary" component="div">
                <strong>{key}:</strong>
              </Typography>
              {editingField === key ? (
                <TextField
                  autoFocus
                  fullWidth
                  variant="outlined"
                  value={editedValue || userData[key]}
                  onChange={(e) => setEditedValue(e.target.value)}
                  onBlur={() => handleBlurOrEnter(key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleBlurOrEnter(key);
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => handleBlurOrEnter(key)}
                        >
                          <EditIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              ) : (
                <>
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
                </>
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
