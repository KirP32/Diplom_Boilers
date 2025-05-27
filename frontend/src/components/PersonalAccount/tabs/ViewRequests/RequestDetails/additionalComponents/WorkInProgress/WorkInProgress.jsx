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
  sseEvent,
}) {
  const [servicesCatalog, setServicesCatalog] = useState([]);
  const [goodsCatalog, setGoodsCatalog] = useState([]);

  const [actualGoodsAndServices, setActualGoodsAndServices] = useState({
    services: [],
    goods: [],
  });

  const [editableServices, setEditableServices] = useState([]);
  const [editableGoods, setEditableGoods] = useState([]);

  const [date, setDate] = useState("");
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    $api.get(`/getRepairDate/${requestID}/completion`).then((res) => {
      setDate(res.data.date);
    });
  }, [requestID]);

  useEffect(() => {
    if (!requestID) return;

    let isActive = true;
    $api
      .get(`/getServicePricesRequest/${requestID}`)
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
    if (!sseEvent) return;
    if (sseEvent.type === "servicesAndGoods") {
      getActualGoodsAndServices();
    }
    if (sseEvent.type === "completionDate_updated") {
      $api.get(`/getRepairDate/${requestID}/completion`).then((res) => {
        setDate(res.data.date);
      });
    }
  }, [requestID, sseEvent]);

  useEffect(() => {
    $api
      .get(`/getGoods`)
      .then((result) => setGoodsCatalog(result.data))
      .catch((error) => console.error(error));
  }, []);

  async function getActualGoodsAndServices() {
    await $api
      .get(`/getActualGoodsAndServices/${requestID}`)
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
    const intervalId = setInterval(() => getActualGoodsAndServices(), 60000);
    return () => clearInterval(intervalId);
  }, [requestID, worker_region]);

  useEffect(() => {
    if (isEditing) {
      setEditableServices(
        actualGoodsAndServices.services.map((s) => ({
          ...s,
          amount: s.amount || 1,
        }))
      );
      setEditableGoods(
        actualGoodsAndServices.goods.map((g) => ({
          ...g,
          amount: g.amount || 1,
        }))
      );
    }
  }, [isEditing, actualGoodsAndServices]);

  const handleServiceSelect = (event, value) => {
    if (!value) return;
    const alreadySelected = editableServices.some(
      (s) => s.service_id === value.service_id
    );
    if (!alreadySelected) {
      setEditableServices((prev) => [...prev, { ...value, amount: 1 }]);
    }
  };

  const handleGoodsSelect = (event, value) => {
    if (!value) return;
    const alreadySelected = editableGoods.some((g) => g.id === value.id);
    if (!alreadySelected) {
      setEditableGoods((prev) => [...prev, { ...value, amount: 1 }]);
    }
  };

  const handleServiceAmountChange = (id, value) => {
    setEditableServices((prev) =>
      prev.map((s) =>
        s.service_id === id ? { ...s, amount: parseInt(value) || 1 } : s
      )
    );
  };

  const handleGoodsAmountChange = (id, value) => {
    setEditableGoods((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, amount: parseInt(value) || 1 } : g
      )
    );
  };

  const handleDeleteService = (service_id) => {
    setEditableServices((prev) =>
      prev.filter((s) => s.service_id !== service_id)
    );
  };

  const handleDeleteGoods = (id) => {
    setEditableGoods((prev) => prev.filter((g) => g.id !== id));
  };

  const handleConfirmChanges = async () => {
    const data = {
      requestID,
      services: editableServices,
      goods: editableGoods,
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
                {(isEditing
                  ? editableServices
                  : actualGoodsAndServices.services
                ).map((service) => (
                  <ListItem
                    key={service.service_id}
                    secondaryAction={
                      isEditing && (
                        <>
                          <TextField
                            label="Кол-во"
                            type="number"
                            size="small"
                            value={service.amount || 1}
                            onChange={(e) =>
                              handleServiceAmountChange(
                                service.service_id,
                                e.target.value
                              )
                            }
                            sx={{ width: 80, mr: 1 }}
                          />
                          <IconButton
                            edge="end"
                            onClick={() =>
                              handleDeleteService(service.service_id)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )
                    }
                  >
                    <ListItemText
                      primary={`${service.service_name} (x${
                        service.amount || 1
                      })`}
                      secondary={
                        access_level === 3
                          ? `Цена: ${(
                              service.base_price *
                              service.coefficient *
                              service.amount
                            ).toFixed(2)} руб. с учётом коэффициента АСЦ: ${
                              service.coefficient
                            }`
                          : `Цена: ${(
                              service.base_price *
                              service.coefficient *
                              service.amount
                            ).toFixed(2)} руб.`
                      }
                    />
                  </ListItem>
                ))}
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
                {(isEditing ? editableGoods : actualGoodsAndServices.goods).map(
                  (good) => (
                    <ListItem
                      key={good.id}
                      secondaryAction={
                        isEditing && (
                          <>
                            <TextField
                              label="Кол-во"
                              type="number"
                              size="small"
                              value={good.amount || 1}
                              onChange={(e) =>
                                handleGoodsAmountChange(good.id, e.target.value)
                              }
                              sx={{ width: 80, mr: 1 }}
                            />
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteGoods(good.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )
                      }
                    >
                      <ListItemText
                        primary={`${good.name} (x${good.amount || 1})`}
                        secondary={`Артикул: ${good.article}, Цена: ${(
                          good.price * good.amount
                        ).toFixed(2)}`}
                      />
                    </ListItem>
                  )
                )}
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
        <Typography variant="h5">Дата завершения работ:</Typography>
        <TextField
          type="date"
          value={date || ""}
          onChange={(e) => setDate(e.target.value)}
          disabled={!isEditingDate}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { sx: { mr: 2 } },
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
      <SignatureUploader requestID={requestID} sseEvent={sseEvent} />
    </Box>
  );
}
