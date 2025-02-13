import { useEffect, useState } from "react";
import $api from "../../../http";
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
} from "@mui/material";
import { Edit, Delete, Add, Check } from "@mui/icons-material";
import styles from "./DataBaseUsers.module.scss";

export default function DataBaseUsers() {
  const [columns, setColumns] = useState([]);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editedValue, setEditedValue] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState("");

  useEffect(() => {
    $api
      .get("/getDatabaseColumns")
      .then((result) => {
        setColumns(result.data);
      })
      .catch((error) => {
        console.log(error);
        setColumns([]);
      });
  }, []);

  const handleEdit = (col) => {
    setEditingColumn(col);
    setEditedValue(col.column_name);
  };

  const handleSave = () => {
    if (editingColumn && editedValue !== editingColumn.column_name) {
      $api
        .post("/updateDatabaseColumn", {
          oldName: editingColumn.column_name,
          newName: editedValue,
        })
        .then(() => {
          setColumns(
            columns.map((col) =>
              col.column_name === editingColumn.column_name
                ? { column_name: editedValue, data_type: col.data_type }
                : col
            )
          );
          setEditingColumn(null);
          setEditedValue("");
        })
        .catch((error) => {
          console.log("Ошибка обновления:", error);
        });
    } else {
      setEditingColumn(null);
    }
  };

  const handleDelete = async (columnName) => {
    try {
      await $api.delete(`/deleteDatabaseColumn/${columnName}`);
      setColumns((prevColumns) =>
        prevColumns.filter((col) => col.column_name !== columnName)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setNewColumnName("");
    setNewColumnType("character varying");
  };

  const handleAddSave = () => {
    if (newColumnName.trim() !== "" && newColumnType !== "") {
      $api
        .post("/addDatabaseColumn", {
          column_name: newColumnName,
          column_type: newColumnType,
        })
        .then(() => {
          setColumns([
            ...columns,
            { column_name: newColumnName, data_type: newColumnType },
          ]);
          setNewColumnName("");
          setNewColumnType("");
          setIsAdding(false);
        })
        .catch((error) => {
          console.error("Ошибка добавления:", error);
        });
    } else {
      setIsAdding(false);
      setNewColumnName("");
      setNewColumnType("");
    }
  };

  return (
    <div className={styles.data_table__wrapper}>
      <div
        className={styles.headerContainer}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h5" className={styles.data_table__header}>
          Таблица user_details
        </Typography>
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
                  col.column_name !== "id" && (
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
    </div>
  );
}
