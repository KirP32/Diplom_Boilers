/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo, useCallback } from "react";
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
  TableCell,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import $api from "../../../../../../../http";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import region_data from "../../../../../../WorkerPanel/DataBaseUsers/russian_regions_codes.json";

export default function Materials({
  requestID,
  access_level,
  worker_region,
  setSnackbarOpen,
  fullItem,
  setFullItem,
  sseEvent,
  getData,
}) {
  const [services, setServices] = useState([]);
  const [goods, setGoods] = useState([]);
  const [actualGoodsAndServices, setActualGoodsAndServices] = useState({
    services: [],
    goods: [],
  });
  const [editableServices, setEditableServices] = useState([]);
  const [editableGoods, setEditableGoods] = useState([]);

  const [filterName, setFilterName] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [workerList, setWorkerList] = useState([]);
  const [selectedId, setSelectedId] = useState(fullItem?.assigned_to);
  useEffect(() => {
    $api
      .get(`/getWorkerList/${fullItem.region_code}`)
      .then((res) => setWorkerList(res.data))
      .catch(console.error);
  }, [fullItem?.region_code]);

  const filtered = useMemo(() => {
    return workerList.filter((w) => {
      return (
        w.username.toLowerCase().includes(filterName.toLowerCase()) &&
        w.company_name.toLowerCase().includes(filterCompany.toLowerCase())
      );
    });
  }, [workerList, filterName, filterCompany]);

  const handleSelect = async (w) => {
    let data = {};
    if (selectedId === w.user_id) {
      setSelectedId(null);
      data = {
        requestID: fullItem.id,
        id: null,
        username: "Нет",
        access_level: 0,
      };
    } else {
      setSelectedId(w.user_id);
      data = { requestID: fullItem.id, ...w, access_level: 1 };
    }
    await $api
      .post("/setNewWorker", data)
      .then(() => {
        setFullItem({
          worker_username:
            selectedId === w.user_id ? "Нет информации" : w.username,
          worker_phone:
            selectedId === w.user_id ? "Нет информации" : w.phone_number,
        });
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    $api
      .get(`/getGoods`)
      .then((res) => setGoods(res.data))
      .catch(console.error);
  }, []);

  const fetchServicePrices = useCallback(async () => {
    if (!requestID) return;
    try {
      const res = await $api.get(`/getServicePricesRequest/${requestID}`);
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [requestID]);

  useEffect(() => {
    fetchServicePrices();
  }, [fetchServicePrices, fullItem?.worker_username]);

  useEffect(() => {
    if (sseEvent?.type === "servicesAndGoods") {
      getActualGoodsAndServices();
    }
  }, [sseEvent]);

  async function getActualGoodsAndServices() {
    if (worker_region !== null) {
      await $api
        .get(`/getActualGoodsAndServices/${requestID}`)
        .then((result) => {
          const servicesWithAmount =
            result.data?.services?.map((s) => ({
              ...s,
              amount: s.amount || 1,
            })) || [];
          const goodsWithAmount =
            result.data?.goods?.map((g) => ({ ...g, amount: g.amount || 1 })) ||
            [];
          setActualGoodsAndServices({
            services: servicesWithAmount,
            goods: goodsWithAmount,
          });
          setEditableServices(servicesWithAmount);
          setEditableGoods(goodsWithAmount);
        })
        .catch(console.error);
    } else {
      setActualGoodsAndServices({ services: [], goods: [] });
    }
  }

  useEffect(() => {
    getActualGoodsAndServices();
    const intervalId = setInterval(() => getActualGoodsAndServices(), 60000);
    return () => clearInterval(intervalId);
  }, [requestID, worker_region]);

  const handleServiceSelect = (e, value) => {
    if (access_level !== 3 || !value) return;
    const exists = editableServices.some(
      (s) => s.service_id === value.service_id
    );
    if (!exists)
      setEditableServices((prev) => [...prev, { ...value, amount: 1 }]);
  };

  const handleGoodsSelect = (e, value) => {
    if (access_level !== 3 || !value) return;
    const exists = editableGoods.some((g) => g.id === value.id);
    if (!exists) setEditableGoods((prev) => [...prev, { ...value, amount: 1 }]);
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

  const handleRemoveService = async (id) => {
    const isConfirmed = actualGoodsAndServices.services.some(
      (s) => s.service_id === id
    );
    if (isConfirmed) {
      await $api.delete(`/deleteRequestService/${requestID}/${id}`);
      await getActualGoodsAndServices();
    } else {
      setEditableServices((prev) => prev.filter((s) => s.service_id !== id));
    }
  };

  const handleRemoveGoods = async (id) => {
    const isConfirmed = actualGoodsAndServices.goods.some((g) => g.id === id);
    if (isConfirmed) {
      await $api.delete(`/deleteRequestGood/${requestID}/${id}`);
      await getActualGoodsAndServices();
    } else {
      setEditableGoods((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleConfirm = async () => {
    const data = {
      requestID,
      services: editableServices,
      goods: editableGoods,
    };
    await $api
      .post("/InsertGoodsServices", data)
      .then(() => {
        setSnackbarOpen(true);
        getData();
      })
      .catch(() => {});
    getActualGoodsAndServices();
  };

  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom>
        <b> Услуги и запчасти</b>
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{ p: 2, height: 400, display: "flex", flexDirection: "column" }}
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
                noOptionsText="Нет услуг"
                sx={{ mb: 2 }}
              />
            )}
            <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
              <List>
                {editableServices.map((service) => (
                  <ListItem
                    key={service.service_id}
                    secondaryAction={
                      access_level === 3 && (
                        <>
                          <TextField
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
                            onClick={() =>
                              handleRemoveService(service.service_id)
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
                      secondary={`Цена: ${(
                        service.base_price *
                        service.coefficient *
                        service.amount
                      ).toFixed(2)} руб.`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{ p: 2, height: 400, display: "flex", flexDirection: "column" }}
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
                noOptionsText="Нет запчастей"
                sx={{ mb: 2 }}
              />
            )}
            <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
              <List>
                {editableGoods.map((good) => (
                  <ListItem
                    key={good.id}
                    secondaryAction={
                      access_level === 3 && (
                        <>
                          <TextField
                            type="number"
                            size="small"
                            value={good.amount || 1}
                            onChange={(e) =>
                              handleGoodsAmountChange(good.id, e.target.value)
                            }
                            sx={{ width: 80, mr: 1 }}
                          />
                          <IconButton
                            onClick={() => handleRemoveGoods(good.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )
                    }
                  >
                    <ListItemText
                      primary={`${good.name} (x${good.amount || 1})`}
                      secondary={`Цена: ${(good.price * good.amount).toFixed(
                        2
                      )} руб.`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Таблица АСЦ */}
      {access_level === 3 && (
        <Box sx={{ m: 3 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Поиск по АСЦ"
              size="small"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
            <TextField
              label="Поиск по компании"
              size="small"
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
            />
          </Box>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>АСЦ</TableCell>
                  <TableCell>Регион</TableCell>
                  <TableCell>Заявки</TableCell>
                  <TableCell>Компания</TableCell>
                  <TableCell>ФИО</TableCell>
                  <TableCell>Телефон</TableCell>
                  <TableCell>Адрес</TableCell>
                  <TableCell align="center">Выбрать</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((w) => (
                  <TableRow key={w.user_id} hover>
                    <TableCell>{w.username}</TableCell>
                    <TableCell>
                      {
                        region_data.find(
                          (item) => item.code === Number(w.region)
                        )?.name
                      }
                    </TableCell>
                    <TableCell>{w.active_requests}</TableCell>
                    <TableCell>{w.company_name}</TableCell>
                    <TableCell>{w.full_name}</TableCell>
                    <TableCell>{w.phone_number}</TableCell>
                    <TableCell>{w.legal_address}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color={w.user_id === selectedId ? "success" : "default"}
                        onClick={() => handleSelect(w)}
                      >
                        {w.user_id === selectedId ? (
                          <CheckCircleOutlineIcon />
                        ) : (
                          <AddCircleOutlineIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Typography align="center" color="text.secondary">
                        Нет АСЦ по заданным фильтрам
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {access_level === 3 && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button variant="contained" color="success" onClick={handleConfirm}>
            Подтвердить АСЦ, Услуги и Запчасти
          </Button>
        </Box>
      )}
    </Box>
  );
}
