import { useEffect, useState } from "react";
import $api from "../../../http";
import logout from "../../Logout/logout";

import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Autocomplete,
} from "@mui/material";
import { Edit, Delete, Add, Check } from "@mui/icons-material";
import styles from "./DataBaseUsers.module.scss";
import { useNavigate } from "react-router-dom";

export default function DataBaseUsers() {
  const navigate = useNavigate();

  const [allColumns, setAllColumns] = useState({});

  const [columns, setColumns] = useState([]);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editedValue, setEditedValue] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState("character varying");

  const [userName, setUserName] = useState("");
  const [userLevel, setUserLevel] = useState(0);

  const [tableName, setTableName] = useState("user_details");
  const [workerNameArr, setWorkerNameArr] = useState([]);

  const [columnsData, setColumnsData] = useState([]);

  const tableMapping = {
    user_details: "user_details",
    worker_details: "worker_details",
    cgs_details: "cgs_details",
    gef_details: "gef_details",
    user_requests_info: "user_requests_info",
  };

  useEffect(() => {
    $api
      .get("/getDatabaseColumns")
      .then((result) => {
        setAllColumns(result.data);
        if (tableName && result.data[tableMapping[tableName]]) {
          setColumns(result.data[tableMapping[tableName]]);
        }
      })
      .catch(() => setAllColumns({}));
  }, []);

  useEffect(() => {
    $api
      .get("/getAllUsers")
      .then((result) => {
        const names = result.data.map((user) => user.username);
        setWorkerNameArr(names);
      })
      .catch((error) => {
        console.log(error);
        setWorkerNameArr([]);
      });
  }, []);

  useEffect(() => {
    if (tableName && allColumns[tableMapping[tableName]]) {
      setColumns(allColumns[tableMapping[tableName]]);
    } else {
      setColumns([]);
    }
  }, [tableName, allColumns]);

  useEffect(() => {
    $api
      .get("/getColumnsData")
      .then((result) => {
        setColumnsData(result.data);
      })
      .catch((error) => {
        setColumnsData(null);
      });
  });

  const handleEdit = (col) => {
    setEditingColumn(col);
    setEditedValue(col.column_name);
  };

  const handleSave = () => {
    if (!editingColumn || editedValue === editingColumn.column_name) {
      setEditingColumn(null);
      return;
    }

    $api
      .post("/updateDatabaseColumn", {
        oldName: editingColumn.column_name,
        newName: editedValue,
        tableName,
      })
      .then(() => {
        setColumns((prev) =>
          prev.map((col) =>
            col.column_name === editingColumn.column_name
              ? { column_name: editedValue, data_type: col.data_type }
              : col
          )
        );
        setEditingColumn(null);
        setEditedValue("");
      })
      .catch((error) => {
        console.error("Ошибка обновления:", error);
        if (
          error.status === 401 &&
          localStorage.getItem("stay_logged") === "false"
        ) {
          logout(navigate);
        }
      });
  };

  const handleDelete = async (columnName) => {
    try {
      await $api.delete(`/deleteDatabaseColumn/${columnName}/${tableName}`);
      setColumns((prev) =>
        prev.filter((col) => col.column_name !== columnName)
      );
    } catch (error) {
      console.error(error);
      if (
        error.status === 401 &&
        localStorage.getItem("stay_logged") === "false"
      ) {
        logout(navigate);
      }
    }
  };

  const handleAdd = () => {
    setIsAdding(!isAdding);
    setNewColumnName("");
    setNewColumnType("character varying");
  };

  const handleAddSave = () => {
    if (!newColumnName.trim() || !newColumnType) {
      setIsAdding(false);
      return;
    }

    $api
      .post("/addDatabaseColumn", {
        column_name: newColumnName,
        column_type: newColumnType,
        tableName,
      })
      .then(() => {
        setColumns((prev) => [
          ...prev,
          { column_name: newColumnName, data_type: newColumnType },
        ]);
        setNewColumnName("");
        setNewColumnType("character varying");
        setIsAdding(false);
      })
      .catch((error) => {
        console.error("Ошибка добавления:", error);
        if (
          error.status === 401 &&
          localStorage.getItem("stay_logged") === "false"
        ) {
          logout(navigate);
        }
      });
  };

  const handleSetAccessLevel = () => {
    if (!userName.trim()) {
      alert("Введите имя пользователя");
      return;
    }

    $api
      .put("/setAccessLevel", { username: userName, access_level: userLevel })
      .then(() => alert("Уровень доступа обновлён"))
      .catch((error) => {
        alert("Ошибка обновления уровня доступа");
        if (
          error.status === 401 &&
          localStorage.getItem("stay_logged") === "false"
        ) {
          logout(navigate);
        }
      });
  };

  return (
    <div className={styles.data_table__wrapper} style={{ overflowY: "auto" }}>
      <div
        className={styles.headerContainer}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <section
          style={{ display: "flex", gap: "25px", paddingBottom: "15px" }}
        >
          <Typography variant="h5" className={styles.data_table__header}>
            Таблица
          </Typography>
          <FormControl sx={{ width: 250 }}>
            <InputLabel id="table_label">Таблица</InputLabel>
            <Select
              label="Таблица"
              value={tableName}
              labelId="table_label"
              onChange={(e) => setTableName(e.target.value)}
            >
              <MenuItem value="user_details">Клиенты</MenuItem>
              <MenuItem value="worker_details">АСЦ</MenuItem>
              <MenuItem value="cgs_details">WATTSON</MenuItem>
              <MenuItem value="gef_details">GEFFEN</MenuItem>
              <MenuItem value="user_requests_info">
                <strong>ЗАЯВКИ</strong>
              </MenuItem>
            </Select>
          </FormControl>
        </section>

        <IconButton color="success" onClick={handleAdd}>
          <Add />
        </IconButton>
      </div>

      {columns.length > 0 ? (
        <TableContainer
          component={Paper}
          className={styles.data_table__container}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Название столбца</strong>
                </TableCell>
                <TableCell>
                  <strong>Тип данных</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Действия</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isAdding && (
                <TableRow>
                  <TableCell>
                    <TextField
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      autoFocus
                      size="small"
                      placeholder="Введите имя столбца"
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="add-select-type-label">
                        Тип данных
                      </InputLabel>
                      <Select
                        labelId="add-select-type-label"
                        value={newColumnType}
                        label="Тип данных"
                        onChange={(e) => setNewColumnType(e.target.value)}
                      >
                        <MenuItem value="bigint">bigint</MenuItem>
                        <MenuItem value="character varying">
                          character varying
                        </MenuItem>
                        <MenuItem value="timestamp without time zone">
                          timestamp without time zone
                        </MenuItem>
                        <MenuItem value="integer">integer</MenuItem>
                        <MenuItem value="text">text</MenuItem>
                        <MenuItem value="boolean">boolean</MenuItem>
                        <MenuItem value="date">date</MenuItem>
                        <MenuItem value="numeric">numeric</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="success" onClick={handleAddSave}>
                      <Add />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )}

              {columns.map(
                (col) =>
                  col.column_name !== "id" &&
                  col.column_name !== "username" &&
                  !(
                    col.column_name === "request_id" &&
                    tableName === "user_requests_info"
                  ) && (
                    <TableRow key={col.column_name}>
                      <TableCell>
                        {editingColumn &&
                        editingColumn.column_name === col.column_name ? (
                          <TextField
                            value={editedValue}
                            onChange={(e) => setEditedValue(e.target.value)}
                            size="small"
                            placeholder="Введите имя столбца"
                          />
                        ) : (
                          col.column_name
                        )}
                      </TableCell>
                      <TableCell>{col.data_type}</TableCell>
                      <TableCell align="right">
                        {editingColumn &&
                        editingColumn.column_name === col.column_name ? (
                          <IconButton color="success" onClick={handleSave}>
                            <Check />
                          </IconButton>
                        ) : (
                          <>
                            <IconButton
                              color="primary"
                              onClick={() => handleEdit(col)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              color="secondary"
                              onClick={() => handleDelete(col.column_name)}
                            >
                              <Delete />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1">Идёт загрузка таблицы...</Typography>
      )}

      <div
        className="access_level__container"
        style={{
          marginTop: "10px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <Autocomplete
          sx={{ width: "300px" }}
          options={workerNameArr}
          value={userName}
          onChange={(event, newValue) => setUserName(newValue || "")}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Введите имя пользователя"
              size="small"
            />
          )}
          freeSolo
        />

        <FormControl sx={{ width: "300px" }} size="small">
          <InputLabel id="access-level-label">Уровень</InputLabel>
          <Select
            value={userLevel}
            labelId="access-level-label"
            label="Уровень"
            onChange={(e) => setUserLevel(e.target.value)}
          >
            <MenuItem value={0}>Клиент</MenuItem>
            <MenuItem value={1}>АСЦ</MenuItem>
            <MenuItem value={2}>WATTSON</MenuItem>
            <MenuItem value={3}>GEFFEN</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSetAccessLevel}
        >
          Установить
        </Button>
      </div>
      {columnsData &&
        columnsData[tableName] &&
        columnsData[tableName].length > 0 && (
          <>
            <Typography
              variant="h5"
              className={styles.data_table__header}
              style={{ paddingTop: "15px" }}
            >
              Данные таблицы {tableName}
            </Typography>
            <TableContainer
              component={Paper}
              className={styles.data_table__container}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    {Object.keys(columnsData[tableName][0]).map((colKey) => (
                      <TableCell key={colKey}>
                        <strong>{colKey}</strong>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {columnsData[tableName].map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Object.keys(row).map((colKey) => (
                        <TableCell key={colKey}>{row[colKey]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
    </div>
  );
}
