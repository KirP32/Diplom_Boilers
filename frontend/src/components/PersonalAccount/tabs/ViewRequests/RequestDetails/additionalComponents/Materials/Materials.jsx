/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Typography,
  TextField,
  Autocomplete,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import $api from "../../../../../../../http";

export default function Materials({
  requestID,
  access_level,
  worker_username,
  worker_region,
}) {
  const [services, setServices] = useState([]);
  const [goods, setGoods] = useState([]);

  const [actualGoodsAndServices, setActualGoodsAndServices] = useState({
    services: [],
    goods: [],
  });

  const [pendingServices, setPendingServices] = useState([]);
  const [pendingGoods, setPendingGoods] = useState([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    $api
      .get(`/getServicePrices/${worker_username}`)
      .then((result) => setServices(result.data))
      .catch((error) => console.error(error));
  }, [worker_username]);

  useEffect(() => {
    $api
      .get(`/getGoods`)
      .then((result) => setGoods(result.data))
      .catch((error) => console.error(error));
  }, []);

  async function getActualGoodsAndServices() {
    await $api
      .get(`/getActualGoodsAndServices/${requestID}/${worker_region}`)
      .then((result) => {
        setActualGoodsAndServices({
          services: result.data?.services || [],
          goods: result.data?.goods || [],
        });
      })
      .catch((error) => console.log(error));
  }

  useEffect(() => {
    getActualGoodsAndServices();
    const intervalId = setInterval(() => {
      getActualGoodsAndServices();
    }, 120000);
    return () => clearInterval(intervalId);
  }, [requestID, worker_region]);

  const handleServiceSelect = (event, value) => {
    if (access_level !== 3 || !value) return;
    const alreadySelected =
      actualGoodsAndServices.services.some(
        (s) => s.service_id === value.service_id
      ) || pendingServices.some((s) => s.service_id === value.service_id);
    if (!alreadySelected) {
      setPendingServices((prev) => [...prev, value]);
    }
  };

  const handleGoodsSelect = (event, value) => {
    if (access_level !== 3 || !value) return;
    const alreadySelected =
      actualGoodsAndServices.goods.some((g) => g.id === value.id) ||
      pendingGoods.some((g) => g.id === value.id);
    if (!alreadySelected) {
      setPendingGoods((prev) => [...prev, value]);
    }
  };

  const handleRemoveService = (service_id) => {
    setPendingServices((prev) =>
      prev.filter((s) => s.service_id !== service_id)
    );
  };

  const handleRemoveGoods = (id) => {
    setPendingGoods((prev) => prev.filter((g) => g.id !== id));
  };

  const handleDeleteConfirmedService = async (service_id) => {
    await $api.delete(`/deleteRequestService/${requestID}/${service_id}`);
    getActualGoodsAndServices();
  };

  const handleDeleteConfirmedGoods = async (good_id) => {
    await $api.delete(`/deleteRequestGood/${requestID}/${good_id}`);
    getActualGoodsAndServices();
  };

  const unionServices = [
    ...actualGoodsAndServices.services,
    ...pendingServices.filter(
      (ps) =>
        !actualGoodsAndServices.services.some(
          (s) => s.service_id === ps.service_id
        )
    ),
  ];
  const unionGoods = [
    ...actualGoodsAndServices.goods,
    ...pendingGoods.filter(
      (pg) => !actualGoodsAndServices.goods.some((g) => g.id === pg.id)
    ),
  ];

  const handleConfirm = async () => {
    const data = {
      requestID,
      services: unionServices,
      goods: unionGoods,
    };
    await $api
      .post("/InsertGoodsServices", data)
      .then(() => {
        setSnackbarOpen(true);
      })
      .catch(() => setSnackbarOpen(false));
  };

  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom>
        Выберите услуги и запчасти
      </Typography>
      <Grid container spacing={2}>
        {/* Блок услуг */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              height: "400px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Услуги
            </Typography>
            {access_level === 3 && (
              <Autocomplete
                options={services}
                getOptionLabel={(option) => option.service_name || ""}
                onChange={handleServiceSelect}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Найти услугу"
                    variant="outlined"
                  />
                )}
                sx={{ mb: 2 }}
              />
            )}
            <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
              <List>
                {unionServices.map((service) => {
                  const isConfirmed = actualGoodsAndServices.services.some(
                    (s) => s.service_id === service.service_id
                  );
                  const isPending = pendingServices.some(
                    (s) => s.service_id === service.service_id
                  );
                  return (
                    <ListItem
                      key={service.service_id}
                      secondaryAction={
                        access_level === 3 && (
                          <>
                            {isConfirmed && (
                              <IconButton
                                edge="end"
                                onClick={() =>
                                  handleDeleteConfirmedService(
                                    service.service_id
                                  )
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                            {isPending && (
                              <IconButton
                                edge="end"
                                onClick={() =>
                                  handleRemoveService(service.service_id)
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </>
                        )
                      }
                    >
                      <ListItemText
                        primary={service.service_name}
                        secondary={
                          access_level === 3
                            ? `Цена: ${service.price}, Коэффициент: ${service.coefficient}`
                            : `Цена: ${service.price}`
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          </Paper>
        </Grid>

        {/* Блок запчастей */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              height: "400px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Запчасти
            </Typography>
            {access_level === 3 && (
              <Autocomplete
                options={goods}
                getOptionLabel={(option) => option.name || ""}
                onChange={handleGoodsSelect}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Найти запчасть"
                    variant="outlined"
                  />
                )}
                sx={{ mb: 2 }}
              />
            )}
            <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
              <List>
                {unionGoods.map((good) => {
                  const isConfirmed = actualGoodsAndServices.goods.some(
                    (g) => g.id === good.id
                  );
                  const isPending = pendingGoods.some((g) => g.id === good.id);
                  return (
                    <ListItem
                      key={good.id}
                      secondaryAction={
                        access_level === 3 && (
                          <>
                            {isConfirmed && (
                              <IconButton
                                edge="end"
                                onClick={() =>
                                  handleDeleteConfirmedGoods(good.id)
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                            {isPending && (
                              <IconButton
                                edge="end"
                                onClick={() => handleRemoveGoods(good.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </>
                        )
                      }
                    >
                      <ListItemText
                        primary={good.name}
                        secondary={`Артикул: ${good.article}, Цена: ${good.price}`}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {access_level === 3 && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button variant="contained" color="success" onClick={handleConfirm}>
            Подтвердить
          </Button>
        </Box>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => {
          setSnackbarOpen(false);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={"success"}
          onClose={() => {
            setSnackbarOpen(false);
          }}
        >
          {"Данные обновлены"}
        </Alert>
      </Snackbar>
    </Box>
  );
}
