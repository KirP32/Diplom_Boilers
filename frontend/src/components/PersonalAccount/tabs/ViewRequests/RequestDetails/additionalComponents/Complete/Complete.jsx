/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import $api from "../../../../../../../http";

export default function Complete({ requestID, worker_region }) {
  const [data, setData] = useState({ services: [], goods: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await $api.get(
          `/getActualGoodsAndServices/${requestID}/${worker_region}`
        );
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

  const totalServices = data.services.reduce(
    (acc, service) => acc + Number(service.price),
    0
  );
  const totalGoods = data.goods.reduce(
    (acc, good) => acc + Number(good.price),
    0
  );
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
      {/* Блок услуг */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        <strong>Услуги</strong>
      </Typography>
      {data.services.length > 0 ? (
        <List sx={{ mb: 1 }}>
          {data.services.map((service) => (
            <ListItem key={service.service_id} disableGutters>
              <ListItemText
                primary={service.service_name}
                secondary={`Цена: ${service.price * service.coefficient}`}
              />
            </ListItem>
          ))}
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

      {/* Блок запчастей */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        <strong>Запчасти</strong>
      </Typography>
      {data.goods.length > 0 ? (
        <List sx={{ mb: 1 }}>
          {data.goods.map((good) => (
            <ListItem key={good.id} disableGutters>
              <ListItemText
                primary={good.name}
                secondary={`Артикул: ${good.article}, Цена: ${good.price}`}
              />
            </ListItem>
          ))}
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
    </Box>
  );
}
