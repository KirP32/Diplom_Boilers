/* eslint-disable react/prop-types */
import {
  Button,
  DialogTitle,
  DialogActions,
  Dialog,
  DialogContent,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import $api from "../../../../http";
import axios from "axios";

export default function AdditionalInfoDialog({
  open,
  item,
  setAdditionalOpen,
}) {
  // const [distance, setDistance] = useState(null);
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

  // useEffect(() => {
  //   $api
  //     .get(`/getLatLon/${item.assigned_to}/${item.system_name}`)
  //     .then((result) => getDistance(result.data.system, result.data.worker))
  //     .catch(() => setDistance(null));
  // }, [item]);

  // async function getDistance(a, b) {
  //   const from = [parseFloat(a.geo_lon), parseFloat(a.geo_lat)];
  //   const to = [parseFloat(b.geo_lon), parseFloat(b.geo_lat)];
  //   await axios
  //     .get(
  //       `https://router.project-osrm.org/route/v1/driving/${from};${to}?overview=false`
  //     )
  //     .then((result) =>
  //       setDistance((result.data.routes[0].distance / 1000).toFixed(1))
  //     );
  // }
  return (
    <Dialog open={open} onClose={() => setAdditionalOpen()}>
      <DialogTitle id="alert-dialog-title">
        <b>Система:</b> {item.system_name}
      </DialogTitle>
      <DialogContent>
        <Box>
          <p>
            <b>Создана:</b> {formatDate(item.created_at)}
          </p>
          <p>
            <b>Проблема:</b> {item.problem_name}
          </p>
          <p>
            <b>Описание:</b> {item.description}
          </p>
          <p>
            <b>Проблема с модулем:</b> {item.module}
          </p>
          <p>
            <b>Контактный номер:</b> {item.phone_number}
          </p>
          <p>
            <b>Ориентировочная цена:</b> {}
          </p>
          {/* <p>
            <b>Расстояние:</b>{" "}
            {distance === null ? "идёт расчёт расстояния..." : distance + " км"}
          </p> */}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAdditionalOpen()}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}
