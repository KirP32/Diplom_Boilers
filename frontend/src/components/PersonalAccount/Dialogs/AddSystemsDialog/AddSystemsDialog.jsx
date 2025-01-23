import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
} from "@mui/material";
import $api from "../../../../http";

export default function AddSystemsDialog({
  open,
  setAddSystemFlag,
  getAllDevices,
}) {
  const [data, setData] = useState([]);
  const [systemName, setSystemName] = useState("");

  async function showAllSystems() {
    try {
      const result = await $api.get("/getAllSystems");
      setData(result.data);
    } catch (error) {
      console.error("Ошибка при загрузке систем:", error);
    }
  }

  useEffect(() => {
    showAllSystems();
  }, []);

  const handleSystemChange = (event) => {
    setSystemName(event.target.value);
  };

  const handleAddSystem = async () => {
    const data = { systemName };
    await $api
      .post("/addSystem", data)
      .then((result) => {
        getAllDevices();
        setAddSystemFlag(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Dialog open={open} onClose={() => setAddSystemFlag(false)}>
      <DialogTitle id="alert-dialog-title">
        Добавьте себе следующую систему:
      </DialogTitle>
      <DialogContent>
        <Select
          value={systemName}
          onChange={handleSystemChange}
          sx={{ fontSize: 17 }}
          fullWidth
        >
          {data.map((item) => (
            <MenuItem key={item.id} value={item.name} sx={{ fontSize: 17 }}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAddSystemFlag(false)}>Отмена</Button>
        <Button
          onClick={handleAddSystem}
          autoFocus
          color="success"
          variant="contained"
        >
          Добавить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
