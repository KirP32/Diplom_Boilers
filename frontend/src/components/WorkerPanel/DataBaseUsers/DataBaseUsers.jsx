/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import $api from "../../../http";
import logout from "../../Logout/logout";
import region_data from "./russian_regions_codes.json";

import {
  IconButton,
  Paper,
  Table,
  TableBody,
  Snackbar,
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
  Alert,
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
  const [columnsData, setColumnsData] = useState({});

  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newRowData, setNewRowData] = useState({});

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Массив с вариантами регионов. 71 – Тульская область,
  const regionOptions = region_data;

  const tableMapping = {
    user_details: "user_details",
    worker_details: "worker_details",
    cgs_details: "cgs_details",
    gef_details: "gef_details",
    user_requests_info: "user_requests_info",
    materials_stage: "materials_stage",
    in_transit_stage: "in_transit_stage",
    work_in_progress_stage: "work_in_progress_stage",
    services_and_prices: "services_and_prices",
  };

  const [filters, setFilters] = useState({});

  const handleFilterChange = (colKey, value) => {
    // обрезаем строку чтобы не было лишних пробелов
    const trimed_value = value.trim();
    setFilters((prevFilters) => ({
      ...prevFilters,
      [colKey]: trimed_value,
    }));
  };

  const filteredData =
    columnsData[tableName]?.filter((row) =>
      Object.keys(filters).every((colKey) => {
        const filterValue = filters[colKey];
        if (!filterValue) return true;

        if (colKey === "region") {
          const selectedRegion = regionOptions.find(
            (opt) => opt.name.toLowerCase() === filterValue.toLowerCase()
          );
          return selectedRegion
            ? Number(row[colKey]) === selectedRegion.code
            : false;
        }

        return row[colKey]
          ?.toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      })
    ) || [];

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
  }, []);

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

  // Обработчики для строк нижней таблицы

  const handleEditRow = (rowIndex) => {
    setEditingRowIndex(rowIndex);
    setEditedRowData(columnsData[tableName][rowIndex]);
  };

  const handleSaveRow = (rowIndex) => {
    const rowToUpdate = editedRowData;
    $api
      .put("/updateRowData", {
        ...rowToUpdate,
      })
      .then(() => {
        const updatedRows = [...columnsData[tableName]];
        updatedRows[rowIndex] = rowToUpdate;
        setColumnsData((prev) => ({ ...prev, [tableName]: updatedRows }));
        setEditingRowIndex(null);
        setEditedRowData({});
      })
      .catch((error) => {
        console.error("Ошибка обновления записи:", error);
        setErrorMessage("Ошибка обновления записи:", error);
        setSnackbarOpen(true);
        if (
          error.status === 401 &&
          localStorage.getItem("stay_logged") === "false"
        ) {
          logout(navigate);
        }
      });
  };

  const handleDeleteRow = (rowIndex) => {
    const rowToDelete = columnsData[tableName][rowIndex];

    $api
      .delete(
        `/deleteRowData/${rowToDelete.service_id}/${rowToDelete.service_name}`
      )
      .then(() => {
        const updatedRows = columnsData[tableName].filter(
          (_, i) => i !== rowIndex
        );
        setColumnsData((prev) => ({ ...prev, [tableName]: updatedRows }));
      })
      .catch((error) => {
        console.error("Ошибка удаления записи:", error);
        setErrorMessage("Ошибка удаления записи: ", error);
        setSnackbarOpen(true);
        if (
          error.status === 401 &&
          localStorage.getItem("stay_logged") === "false"
        ) {
          logout(navigate);
        }
      });
  };

  const handleAddRow = () => {
    setIsAddingRow(!isAddingRow);
    const keys =
      columnsData[tableName] && columnsData[tableName].length > 0
        ? Object.keys(columnsData[tableName][0])
        : [];
    const initialData = {};
    keys.forEach((key) => {
      initialData[key] = "";
    });
    setNewRowData(initialData);
  };

  const handleAddRowSave = () => {
    $api
      .post("/addRowData", { tableName, rowData: newRowData })
      .then((res) => {
        const newRow = res.data.newRow;
        setColumnsData((prev) => ({
          ...prev,
          [tableName]: [...prev[tableName], newRow],
        }));
        setIsAddingRow(false);
        setNewRowData({});
      })
      .catch((error) => {
        console.error("Ошибка добавления записи:", error);
        setErrorMessage(
          "Сервер недоступен ИЛИ такая услуга и регион уже существуют "
        );
        setSnackbarOpen(true);
        if (
          error.status === 401 &&
          localStorage.getItem("stay_logged") === "false"
        ) {
          logout(navigate);
        }
      });
  };

  console.log("columnsData", columnsData);
  console.log("tableName", tableName);
  console.log("columnsData[tableName]", columnsData[tableName]);
  console.log("columnsData[tableName].length", columnsData[tableName]?.length);

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
          style={{
            display: "flex",
            gap: "25px",
            paddingBottom: "15px",
            alignItems: "center",
          }}
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
              <MenuItem value="materials_stage">Заявка - Материалы</MenuItem>
              <MenuItem value="in_transit_stage">Заявка - В пути</MenuItem>
              <MenuItem value="work_in_progress_stage">
                Заявка - Проводятся работы
              </MenuItem>
              <MenuItem value="services_and_prices">Услуги</MenuItem>
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

      {columnsData && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <Typography
              variant="h5"
              className={styles.data_table__header}
              sx={{ pt: 2, textAlign: "center" }}
            >
              Данные таблицы {tableName}
            </Typography>
            {tableName === "services_and_prices" && (
              <IconButton color="success" onClick={handleAddRow}>
                <Add />
              </IconButton>
            )}
          </div>
          <Paper
            sx={{
              maxWidth: "100%",
              minWidth: "200px",
              mx: "auto",
              overflow: "hidden",
            }}
          >
            <TableContainer
              sx={{ maxHeight: 440, overflowX: "auto", width: "100%" }}
            >
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {Object.keys(columnsData[tableName][0]).map((colKey) => (
                      <TableCell key={colKey}>
                        <strong>{colKey}</strong>
                      </TableCell>
                    ))}
                    {tableName === "services_and_prices" && (
                      <TableCell align="right">
                        <strong>Действия</strong>
                      </TableCell>
                    )}
                  </TableRow>
                  <TableRow>
                    {/* Это фильтры ! Input*/}
                    {Object.keys(columnsData[tableName][0]).map((colKey) => {
                      if (colKey === "service_id") {
                        return <TableCell key={`filter-${colKey}`} />;
                      }
                      return (
                        <TableCell key={`filter-${colKey}`}>
                          {colKey === "region" ? (
                            <Autocomplete
                              options={regionOptions}
                              getOptionLabel={(option) => option.name}
                              value={
                                regionOptions.find(
                                  (opt) => opt.name === filters[colKey]
                                ) || null
                              }
                              onChange={(event, newValue) =>
                                handleFilterChange(
                                  colKey,
                                  newValue ? newValue.name : ""
                                )
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  placeholder="Фильтр"
                                />
                              )}
                            />
                          ) : (
                            <TextField
                              value={filters[colKey] || ""}
                              onChange={(e) =>
                                handleFilterChange(colKey, e.target.value)
                              }
                              size="small"
                              placeholder="Фильтр"
                            />
                          )}
                        </TableCell>
                      );
                    })}
                    {tableName === "services_and_prices" && <TableCell />}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {isAddingRow && tableName === "services_and_prices" && (
                    <TableRow>
                      {Object.keys(newRowData).map((colKey) => {
                        if (colKey === "service_id" || colKey === "spid") {
                          return <TableCell key={colKey} />;
                        }
                        return (
                          <TableCell key={colKey}>
                            {colKey === "region" ? (
                              <Autocomplete
                                options={regionOptions}
                                getOptionLabel={(option) => option.name}
                                value={
                                  regionOptions.find(
                                    (opt) =>
                                      opt.code === Number(newRowData[colKey])
                                  ) || null
                                }
                                onChange={(event, newValue) =>
                                  setNewRowData((prev) => ({
                                    ...prev,
                                    [colKey]: newValue ? newValue.code : "",
                                  }))
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    label="Регион"
                                  />
                                )}
                              />
                            ) : (
                              <TextField
                                value={newRowData[colKey]}
                                onChange={(e) =>
                                  setNewRowData((prev) => ({
                                    ...prev,
                                    [colKey]:
                                      colKey === "service_name"
                                        ? e.target.value
                                        : e.target.value,
                                  }))
                                }
                                onBlur={(e) =>
                                  setNewRowData((prev) => ({
                                    ...prev,
                                    [colKey]:
                                      colKey === "service_name"
                                        ? e.target.value
                                        : e.target.value,
                                  }))
                                }
                                size="small"
                              />
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell align="right">
                        <IconButton color="success" onClick={handleAddRowSave}>
                          <Check />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )}

                  {filteredData.map((row, rowIndex) => (
                    <TableRow key={row.id || rowIndex}>
                      {Object.keys(row).map((colKey) => (
                        <TableCell key={colKey}>
                          {colKey === "service_id" || colKey === "spid" ? (
                            <TableCell>{row[colKey]}</TableCell>
                          ) : editingRowIndex === rowIndex &&
                            tableName === "services_and_prices" ? (
                            colKey === "region" ? (
                              <Autocomplete
                                options={regionOptions}
                                getOptionLabel={(option) => option.name}
                                value={
                                  regionOptions.find(
                                    (opt) =>
                                      opt.code === Number(editedRowData[colKey])
                                  ) || null
                                }
                                onChange={(event, newValue) =>
                                  setEditedRowData((prev) => ({
                                    ...prev,
                                    [colKey]: newValue ? newValue.code : "",
                                  }))
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    label="Регион"
                                  />
                                )}
                              />
                            ) : (
                              <TextField
                                value={editedRowData[colKey]}
                                onChange={(e) =>
                                  setEditedRowData((prev) => ({
                                    ...prev,
                                    [colKey]: e.target.value,
                                  }))
                                }
                                onBlur={(e) =>
                                  setEditedRowData((prev) => ({
                                    ...prev,
                                    [colKey]: e.target.value,
                                  }))
                                }
                                size="small"
                              />
                            )
                          ) : colKey === "region" ? (
                            regionOptions.find(
                              (opt) => opt.code === Number(row[colKey])
                            )?.name || row[colKey]
                          ) : typeof row[colKey] === "boolean" ? (
                            row[colKey] ? (
                              "true"
                            ) : (
                              "false"
                            )
                          ) : (
                            row[colKey]
                          )}
                        </TableCell>
                      ))}
                      {tableName === "services_and_prices" && (
                        <TableCell align="right">
                          {editingRowIndex === rowIndex ? (
                            <IconButton
                              color="success"
                              onClick={() => handleSaveRow(rowIndex)}
                            >
                              <Check />
                            </IconButton>
                          ) : (
                            <>
                              <IconButton
                                color="primary"
                                onClick={() => handleEditRow(rowIndex)}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                color="secondary"
                                onClick={() => handleDeleteRow(rowIndex)}
                              >
                                <Delete />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
              {errorMessage}
            </Alert>
          </Snackbar>
        </>
      )}
    </div>
  );
}
