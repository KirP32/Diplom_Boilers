import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import $api from "../../../../http";

export default function AddSystemsDialog({
  open,
  setAddSystemFlag,
  getAllDevices,
}) {
  const [data, setData] = useState([]);
  const [systemName, setSystemName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      showAllSystems();
    }
  }, [open]);

  async function showAllSystems() {
    try {
      const result = await $api.get("/getAllSystems");
      setData(result.data);
    } catch (error) {
      console.error("Ошибка при загрузке систем:", error);
    }
  }

  const handleSystemChange = (event) => {
    setSystemName(event.target.value);
  };

  const handleAddSystem = async () => {
    if (!systemName || isLoading) return;

    setIsLoading(true);

    try {
      await $api.post("/addSystem", { systemName });
      await getAllDevices();

      setData((prevData) =>
        prevData.filter((item) => item.name !== systemName)
      );

      setSystemName("");
    } catch (error) {
      console.error("Ошибка при добавлении системы:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => setAddSystemFlag(false)}>
      <DialogTitle>Добавьте себе следующую систему:</DialogTitle>
      <DialogContent>
        {data.length > 0 ? (
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
        ) : (
          <p>Систем больше нет...</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAddSystemFlag(false)}>Отмена</Button>
        <Button
          onClick={handleAddSystem}
          color="success"
          variant="contained"
          disabled={data.length < 1 || !systemName || isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Добавить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
