/* eslint-disable react/prop-types */
import { useRef, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Snackbar,
  Alert,
  Slide,
  Autocomplete,
  Box,
  CircularProgress,
} from "@mui/material";
import $api from "../../../../http";
import axios from "axios";
const token = "98be28db4ed79229bc269503c6a4d868e628b318";

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}
export default function CreateSystemDialog({ open, onClose, getAllDevices }) {
  const [systemName, setSystemName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [addressValue, setAddresValue] = useState("");
  const [address_list, setAddressList] = useState([]);
  const debounceRef = useRef(null);
  const [loading, setLoading] = useState(false);
  function handleInputChange(newInputValue) {
    if (newInputValue !== addressValue) {
      setAddresValue(newInputValue);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        handleLegalAddress(newInputValue);
      }, 500);
    }
  }
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
  // async function getGeoData() {
  //   try {
  //     const { data } = await $api.post("/getGeoPosition", { addressValue });
  //     return {
  //       geo_lat: data.geo_lat,
  //       geo_lon: data.geo_lon,
  //     };
  //   } catch (error) {
  //     console.error(error.response?.data || error);
  //     return { geo_lat: null, geo_lon: null };
  //   }
  // }

  const handleCreate = async () => {
    try {
      setLoading(true);
      await $api.post("/createSystem", {
        system_name: systemName,
        addressValue,
      });

      getAllDevices();
      onClose();
    } catch (error) {
      console.error(error);
      if (error.response?.data?.error === "Такая система уже существует") {
        setErrorMessage("Система с таким названием уже существует!");
      } else {
        setErrorMessage("Ошибка добавления системы");
      }
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  async function generateName() {
    await $api
      .get("/getFreeName")
      .then((result) => setSystemName(result.data.freeName))
      .catch((error) => {
        console.log(error);
      });
  }
  function handleChange(event, newValue) {
    if (newValue && typeof newValue === "string") {
      setAddresValue(newValue);
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle style={{ textAlign: "center" }}>
          Создать систему
        </DialogTitle>
        <DialogContent>
          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.7)",
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <TextField
            fullWidth
            margin="dense"
            label="Название системы"
            variant="outlined"
            value={systemName}
            disabled={loading}
            onChange={(e) => setSystemName(e.target.value)}
          />
          <Autocomplete
            freeSolo
            value={addressValue}
            options={address_list}
            filterOptions={(options) => options}
            onInputChange={(event, newInputValue) =>
              handleInputChange(newInputValue)
            }
            onChange={(event, newValue) => handleChange(event, newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Адрес"
                disabled={loading}
                autoFocus
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ display: "flex", justifyContent: "space-around" }}>
          <Button color="primary" variant="outlined" onClick={generateName}>
            Генерация
          </Button>
          <section style={{ gap: "15px", display: "flex", padding: 15 }}>
            <Button onClick={onClose} color="error" variant="outlined">
              Отмена
            </Button>
            <Button
              onClick={handleCreate}
              color="success"
              variant="contained"
              disabled={!systemName?.trim()}
            >
              Создать
            </Button>
          </section>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
