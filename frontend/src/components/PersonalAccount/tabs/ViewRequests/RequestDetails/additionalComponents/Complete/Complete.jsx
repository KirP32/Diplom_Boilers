/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Collapse,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import $api from "../../../../../../../http";

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Complete({ requestID, worker_region }) {
  const [data, setData] = useState({ services: [], goods: [] });
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [logsOpen, setLogsOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await $api.get(`/getActualGoodsAndServices/${requestID}`);
        setData({
          services: res.data?.services || [],
          goods: res.data?.goods || [],
        });
      } catch (error) {
        console.error("Ошибка получения данных:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [requestID, worker_region]);

  useEffect(() => {
    $api
      .get(`/getLogs/${requestID}`)
      .then((result) => setLogs(result.data || []))
      .catch(console.log);
  }, [requestID]);

  const totalServices = data.services.reduce((sum, s) => {
    const base = Number(s.base_price);
    const coeff = Number(s.coefficient || 1);
    const amt = Number(s.amount || 1);
    return sum + base * coeff * amt;
  }, 0);

  const totalGoods = data.goods.reduce((sum, g) => {
    const price = Number(g.price);
    const amt = Number(g.amount || 1);
    return sum + price * amt;
  }, 0);

  const overallTotal = totalServices + totalGoods;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Typography variant="h6">Загрузка...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        <strong>Услуги</strong>
      </Typography>

      {data.services.length ? (
        <List sx={{ mb: 1 }}>
          {data.services.map((s) => {
            const base = Number(s.base_price);
            const coeff = Number(s.coefficient || 1);
            const amt = Number(s.amount || 1);
            const unitCost = base * coeff;
            const rowTotal = unitCost * amt;

            return (
              <ListItem key={s.service_id} disableGutters>
                <ListItemText
                  primary={`${s.service_name} (x${amt})`}
                  secondary={`Сумма: ${rowTotal.toFixed(2)} ₽`}
                />
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Typography variant="body2" sx={{ mb: 1 }}>
          Нет услуг
        </Typography>
      )}

      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Итоговая сумма услуг: {totalServices.toFixed(2)} ₽
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>
        <strong>Запчасти</strong>
      </Typography>

      {data.goods.length ? (
        <List sx={{ mb: 1 }}>
          {data.goods.map((g) => {
            const price = Number(g.price);
            const amt = Number(g.amount || 1);
            const rowTotal = price * amt;

            return (
              <ListItem key={g.id} disableGutters>
                <ListItemText
                  primary={`${g.name} (x${amt})`}
                  secondary={`Артикул: ${g.article}. Сумма: ${rowTotal.toFixed(
                    2
                  )} ₽`}
                />
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Typography variant="body2" sx={{ mb: 1 }}>
          Нет запчастей
        </Typography>
      )}

      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Итоговая сумма запчастей: {totalGoods.toFixed(2)} ₽
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" align="center">
        Общая сумма: {overallTotal.toFixed(2)} ₽
      </Typography>

      <Box
        sx={{
          mt: 3,
          p: 2,
          border: "2px solid",
          borderColor: "primary.main",
          borderRadius: 2,
          textAlign: "center",
          cursor: "pointer",
        }}
        onClick={() => {}}
      >
        <Typography variant="subtitle1">Скачать PDF</Typography>
      </Box>

      <Box
        sx={{
          mt: 3,
          p: 2,
          border: "2px solid",
          borderColor: "primary.main",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => setLogsOpen((prev) => !prev)}
        >
          <Typography variant="subtitle1">ЛОГИ</Typography>
          <IconButton size="small">
            {logsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={logsOpen}>
          {logs.length ? (
            <List>
              {logs
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                .map((log, idx) => (
                  <ListItem key={idx} disableGutters>
                    <ListItemText
                      primary={log.description}
                      secondary={formatDate(log.created_at)}
                    />
                  </ListItem>
                ))}
            </List>
          ) : (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Нет логов
            </Typography>
          )}
        </Collapse>
      </Box>
    </Box>
  );
}
