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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import $api from "../../../../../../../http";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { green } from "@mui/material/colors";
import SignatureUploader from "./SignatureUploader/SignatureUploader";

export default function WorkInProgress({
  requestID,
  access_level,
  worker_username,
  worker_region,
  work_completion_date,
}) {
  const [servicesCatalog, setServicesCatalog] = useState([]);
  const [goodsCatalog, setGoodsCatalog] = useState([]);

  const [actualGoodsAndServices, setActualGoodsAndServices] = useState({
    services: [],
    goods: [],
  });

  const [pendingServices, setPendingServices] = useState([]);
  const [pendingGoods, setPendingGoods] = useState([]);
  const [date, setDate] = useState(work_completion_date?.slice(0, 10) || "");
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  setServicesCatalog;
  useEffect(() => {
    if (!requestID) return;

    let isActive = true;
    $api
      .get(`/getServicePrices/${requestID}`)
      .then((res) => {
        if (isActive) {
          setServicesCatalog(res.data);
        }
      })
      .catch(console.error);

    return () => {
      isActive = false;
    };
  }, [requestID, worker_username]);

  useEffect(() => {
    $api
      .get(`/getGoods`)
      .then((result) => setGoodsCatalog(result.data))
      .catch((error) => console.error(error));
  }, []);

  async function getActualGoodsAndServices() {
    if (worker_region !== null) {
      await $api
        .get(`/getActualGoodsAndServices/${requestID}`)
        .then((result) => {
          setActualGoodsAndServices({
            services: result.data?.services || [],
            goods: result.data?.goods || [],
          });
        })
        .catch((error) => console.log(error));
    } else {
      setActualGoodsAndServices({
        services: [],
        goods: [],
      });
    }
  }

  useEffect(() => {
    getActualGoodsAndServices();
    const intervalId = setInterval(() => getActualGoodsAndServices(), 60000);
    return () => clearInterval(intervalId);
  }, [requestID, worker_region]);

  const handleServiceSelect = (event, value) => {
    if (!value) return;
    const alreadySelected =
      actualGoodsAndServices.services.some(
        (s) => s.service_id === value.service_id
      ) || pendingServices.some((s) => s.service_id === value.service_id);
    if (!alreadySelected) {
      setPendingServices((prev) => [...prev, value]);
    }
  };

  const handleGoodsSelect = (event, value) => {
    if (!value) return;
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
    try {
      await $api.delete(`/deleteRequestService/${requestID}/${service_id}`);
      getActualGoodsAndServices();
    } catch (error) {
      console.error("Ошибка при удалении услуги:", error);
    }
  };

  const handleDeleteConfirmedGoods = async (id) => {
    try {
      await $api.delete(`/deleteRequestGood/${requestID}/${id}`);
      getActualGoodsAndServices();
    } catch (error) {
      console.error("Ошибка при удалении запчасти:", error);
    }
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

  const handleConfirmChanges = async () => {
    const data = {
      requestID,
      services: unionServices,
      goods: unionGoods,
    };
    await $api
      .post("/InsertGoodsServices", data)
      .then(() => {
        setIsEditing(false);
        getActualGoodsAndServices();
      })
      .catch((error) => console.log(error));
  };

  const handleSave = async () => {
    try {
      await $api.post("/updateCompletionDate", {
        saleDate: date,
        id: requestID,
      });
      setIsEditingDate(false);
    } catch (error) {
      console.error("Ошибка при сохранении даты:", error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Итоговые услуги и запчасти
      </Typography>
      <Grid container spacing={2} alignItems="stretch">
        {/* Блок услуг */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              maxHeight: 500,
              height: "100%",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Услуги
            </Typography>
            {isEditing && (
              <Autocomplete
                options={servicesCatalog}
                getOptionLabel={(option) => option.service_name || ""}
                onChange={handleServiceSelect}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Найти услугу"
                    variant="outlined"
                  />
                )}
                noOptionsText="Нет услуг"
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
                        isEditing && (
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
                            ? `Цена: ${
                                service.base_price * service.coefficient
                              } руб. с учётом коэффициента АСЦ: ${
                                service.coefficient
                              }`
                            : `Цена: ${
                                service.base_price * service.coefficient
                              } руб.`
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
              display: "flex",
              flexDirection: "column",
              maxHeight: 500,
              height: "100%",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Запчасти
            </Typography>
            {isEditing && (
              <Autocomplete
                options={goodsCatalog}
                getOptionLabel={(option) => option.name || ""}
                onChange={handleGoodsSelect}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Найти запчасть"
                    variant="outlined"
                  />
                )}
                noOptionsText="Нет запчастей"
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
                        isEditing && (
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

      <Box
        sx={{
          mt: 2,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        {!isEditing && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="h5" sx={{ margin: 0 }}>
              Есть уточнения ?
            </Typography>
            <Button
              variant="contained"
              onClick={() => setIsEditing(true)}
              sx={{ width: "auto" }}
            >
              Отредактируйте
            </Button>
          </Box>
        )}
        {isEditing && (
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmChanges}
            sx={{ width: "auto" }}
          >
            Подтвердить
          </Button>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 2,
          gap: 2,
        }}
      >
        <Typography variant="h5">Дата выполнения работ:</Typography>
        <TextField
          type="date"
          value={date || ""}
          onChange={(e) => setDate(e.target.value)}
          disabled={!isEditingDate}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            htmlInput: {
              sx: { mr: 2 },
            },
          }}
          sx={{ width: 250 }}
        />
        <IconButton
          onClick={() => {
            if (isEditingDate) {
              handleSave();
            } else {
              setIsEditingDate(true);
            }
          }}
          sx={{ color: isEditingDate ? green[600] : "default" }}
        >
          {isEditingDate ? <CheckIcon /> : <EditIcon />}
        </IconButton>
      </Box>
      <SignatureUploader requestID={requestID} />
    </Box>
  );
}
