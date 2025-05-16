/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from "react";
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
}) {
  const [services, setServices] = useState([]);
  const [goods, setGoods] = useState([]);
  const [actualGoodsAndServices, setActualGoodsAndServices] = useState({
    services: [],
    goods: [],
  });

  const [pendingServices, setPendingServices] = useState([]);
  const [pendingGoods, setPendingGoods] = useState([]);
  // Фильтры
  const [filterName, setFilterName] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [workerList, setWorkerList] = useState([]);
  const [selectedId, setSelectedId] = useState(fullItem?.assigned_to);

  useEffect(() => {
    if (!fullItem?.region_code) return;
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
    setPendingServices((prev) =>
      prev.map((ps) => {
        const fresh = services.find((s) => s.service_id === ps.service_id);
        return fresh ? { ...fresh } : ps;
      })
    );
  }, [services]);
  useEffect(() => {
    if (!requestID) return;

    let isActive = true;
    $api
      .get(`/getServicePrices/${requestID}`)
      .then((res) => {
        if (isActive) {
          setServices(res.data);
        }
      })
      .catch(console.error);

    return () => {
      isActive = false;
    };
  }, [requestID, fullItem?.worker_username]);

  useEffect(() => {
    $api
      .get(`/getGoods`)
      .then((result) => setGoods(result.data))
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
    const intervalId = setInterval(() => {
      getActualGoodsAndServices();
    }, 60000);
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
      .catch(() => {});
    setPendingServices([]);
    setPendingGoods([]);
    await getActualGoodsAndServices();
  };

  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom>
        <b> Услуги и запчасти</b>
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
                        access_level === 3 && (
                          <>
                            {isPending ? (
                              <IconButton
                                onClick={() =>
                                  handleRemoveService(service.service_id)
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            ) : isConfirmed ? (
                              <IconButton
                                onClick={() =>
                                  handleDeleteConfirmedService(
                                    service.service_id
                                  )
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            ) : null}
                          </>
                        )
                      }
                    >
                      <ListItemText
                        primary={service.service_name}
                        secondary={
                          access_level === 3
                            ? `Цена: ${
                                service.base_price * service?.coefficient
                              } с учётом коэффициента АСЦ: ${
                                service.coefficient
                              }`
                            : `Цена: ${service.price * service.coefficient}`
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
      {/* АСЦ */}
      {access_level === 3 && (
        <Box sx={{ m: 3 }}>
          {/* Фильтры */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Поиск по АСЦ"
              size="small"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
            {/* <TextField
                  label="Поиск по региону"
                  size="small"
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                /> */}
            <TextField
              label="Поиск по компании"
              size="small"
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
            />
          </Box>

          {/* Таблица */}
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
                        region_data.find((item) => {
                          return item.code === Number(w.region);
                        })?.name
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
