/* eslint-disable react/prop-types */
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import MuiButton from "@mui/material/Button";
import InfoIcon from "@mui/icons-material/Info";
import React, { useEffect, useRef, useState } from "react";
import $api from "../../../http";
import axios from "axios";
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

export default function ListView({
  availData,
  isProcessing,
  addRequest,
  setAdditionalOpen,
  setDetailsObject,
  setCurrentItem,
  removeRequest,
}) {
  const colWidth = "20%";

  const tableSx = {
    minWidth: 650,
    tableLayout: "fixed",
  };

  const headerCellSx = {
    fontWeight: "bold",
    width: colWidth,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return (
    <div>
      <h2
        style={{
          textAlign: "center",
          color: "var(--text-color)",
          marginTop: "20px",
        }}
      >
        Доступные заявки
      </h2>
      <TableContainer component={Paper} sx={{ marginTop: "15px" }}>
        <Table stickyHeader sx={tableSx} aria-label="available table">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Проблема</TableCell>
              <TableCell sx={headerCellSx} align="right">
                Оборудование
              </TableCell>
              {/* <TableCell sx={headerCellSx} align="right">
                Система
              </TableCell> */}
              <TableCell sx={headerCellSx} align="right">
                Расстояние
              </TableCell>
              <TableCell sx={headerCellSx} align="right">
                Создана
              </TableCell>
              <TableCell sx={headerCellSx} align="center">
                Действие
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availData?.allDevices?.map((item) => (
              <RequestRow
                key={item.id}
                item={item}
                isProcessing={isProcessing}
                addRequest={addRequest}
                setAdditionalOpen={setAdditionalOpen}
                setCurrentItem={setCurrentItem}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <h2
        style={{
          textAlign: "center",
          color: "var(--text-color)",
          marginTop: "15px",
        }}
      >
        Заявки в работе
      </h2>
      <TableContainer component={Paper} sx={{ marginTop: "15px" }}>
        <Table stickyHeader sx={tableSx} aria-label="worker table">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Проблема</TableCell>
              <TableCell sx={headerCellSx} align="right">
                Оборудование
              </TableCell>
              {/* <TableCell sx={headerCellSx} align="right">
                Система
              </TableCell> */}
              <TableCell sx={headerCellSx} align="right">
                Расстояние
              </TableCell>
              <TableCell sx={headerCellSx} align="right">
                Создана
              </TableCell>
              <TableCell sx={headerCellSx} align="center">
                Действие
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availData?.workerDevices?.map((item) => (
              <RequestRowInWork
                key={item.id}
                item={item}
                isProcessing={isProcessing}
                setDetailsObject={setDetailsObject}
                removeRequest={removeRequest}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

const RequestRow = React.memo(
  function RequestRow({
    item,
    isProcessing,
    addRequest,
    setAdditionalOpen,
    setCurrentItem,
  }) {
    const [distance, setDistance] = useState(null);
    const abortControllerRef = useRef(null);

    useEffect(() => {
      const fetchData = async () => {
        abortControllerRef.current = new AbortController();
        try {
          const result = await $api.get(
            `/getLatLon/${item.assigned_to}/${item.id}`,
            { signal: abortControllerRef.current.signal }
          );

          const from = [
            parseFloat(result.data.system.geo_lon),
            parseFloat(result.data.system.geo_lat),
          ];
          const to = [
            parseFloat(result.data.worker.geo_lon),
            parseFloat(result.data.worker.geo_lat),
          ];

          const response = await axios.get(
            `https://router.project-osrm.org/route/v1/driving/${from};${to}?overview=false`,
            { signal: abortControllerRef.current.signal }
          );

          setDistance((response.data.routes[0].distance / 1000).toFixed(1));
        } catch (error) {
          if (!axios.isCancel(error)) {
            setDistance(null);
          }
        }
      };

      if (item.assigned_to && item.system_name) {
        fetchData();
      }

      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, [item.assigned_to, item.system_name]);

    return (
      <TableRow key={item.id}>
        <TableCell
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.problem_name}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.module}
        </TableCell>
        {/* <TableCell
          align="right"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.system_name}
        </TableCell> */}
        <TableCell
          align="right"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {distance === null ? "рассчёт расстояния" : distance + " км"}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {formatDate(item.created_at)}
        </TableCell>
        <TableCell align="center" sx={{ position: "relative" }}>
          <MuiButton
            variant="contained"
            onClick={() => addRequest(item.system_name, item.id)}
            disabled={isProcessing}
          >
            Принять
          </MuiButton>
          <InfoIcon
            onClick={() => {
              setAdditionalOpen();
              setCurrentItem(item);
            }}
            style={{
              cursor: "pointer",
              position: "absolute",
              marginLeft: "10px",
              marginTop: "5px",
            }}
          />
        </TableCell>
      </TableRow>
    );
  },
  (prevProps, nextProps) =>
    prevProps.item.id === nextProps.item.id &&
    prevProps.isProcessing === nextProps.isProcessing &&
    prevProps.item.assigned_to === nextProps.item.assigned_to &&
    prevProps.item.system_name === nextProps.item.system_name
);

const RequestRowInWork = React.memo(
  function RequestRowInWork({
    item,
    isProcessing,
    setDetailsObject,
    removeRequest,
  }) {
    const [distance, setDistance] = useState(null);

    useEffect(() => {
      const controller = new AbortController();

      const fetchDistance = async () => {
        try {
          const result = await $api.get(
            `/getLatLon/${item.assigned_to}/${item.id}`,
            { signal: controller.signal }
          );

          const from = [
            parseFloat(result.data.system.geo_lon),
            parseFloat(result.data.system.geo_lat),
          ];
          const to = [
            parseFloat(result.data.worker.geo_lon),
            parseFloat(result.data.worker.geo_lat),
          ];

          const response = await axios.get(
            `https://router.project-osrm.org/route/v1/driving/${from};${to}?overview=false`
          );

          setDistance((response.data.routes[0].distance / 1000).toFixed(1));
        } catch (error) {
          if (!axios.isCancel(error)) {
            setDistance(null);
          }
        }
      };

      if (item.assigned_to && item.system_name) {
        fetchDistance();
      }

      return () => controller.abort();
    }, [item.assigned_to, item.system_name]);

    return (
      <TableRow key={item.id}>
        <TableCell
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.problem_name}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.module}
        </TableCell>
        {/* <TableCell
          align="right"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.system_name}
        </TableCell> */}
        <TableCell
          align="right"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {distance === null ? "рассчёт расстояния" : distance + " км"}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {formatDate(item.created_at)}
        </TableCell>
        <TableCell align="center" sx={{ position: "relative" }}>
          <MuiButton
            variant="contained"
            onClick={() => {
              setDetailsObject(item);
            }}
            disabled={isProcessing}
          >
            Подробнее
          </MuiButton>
          <span
            className="material-icons"
            style={{
              color: "red",
              cursor: "pointer",
              position: "absolute",
              marginLeft: "10px",
              marginTop: "5px",
            }}
            onClick={() => removeRequest(item)}
          >
            cancel
          </span>
        </TableCell>
      </TableRow>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.isProcessing === nextProps.isProcessing &&
      prevProps.item.assigned_to === nextProps.item.assigned_to &&
      prevProps.item.system_name === nextProps.item.system_name
    );
  }
);
