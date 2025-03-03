import { useEffect, useState } from "react";
import { Box, Typography, TextField, IconButton, Divider } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import $api from "../../../../../../http";

export default function DataBaseColums({ stageName, requestID }) {
  const [record, setRecord] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState("");

  useEffect(() => {
    $api
      .get(`/getRequestColumnsData/${stageName}/${requestID}`)
      .then((result) => {
        setRecord(result.data);
      })
      .catch((error) => {
        console.log("Ошибка получения данных:", error);
      });
  }, [requestID, stageName]);

  const handleSaveChanges = (key, newValue) => {
    $api
      .put("/updateRequestColumn", { stageName, key, newValue, id: record.id })
      .then(() => {
        setRecord((prev) => ({ ...prev, [key]: newValue }));
        setEditingField(null);
      })
      .catch((error) => {
        console.error("Ошибка обновления:", error);
      });
  };

  const handleBlurOrEnter = (key) => {
    if (editedValue !== null) {
      handleSaveChanges(key, editedValue);
    }
    setEditingField(null);
  };

  const stageNameTranslations = {
    materials: "Материалы",
    in_transit: "В пути",
    work_in_progress: "Проводятся работы",
  };

  return (
    <Box
      p={2}
      sx={{
        maxHeight: "60%",
        overflowY: "auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <Typography variant="h5" gutterBottom>
        {stageNameTranslations[stageName] || stageName} — данные заявки
      </Typography>
      {record ? (
        Object.keys(record).map((key) => (
          <Box key={key} mb={2}>
            <Typography variant="body2" color="textSecondary">
              <strong>{key}:</strong>
            </Typography>
            {key === "id" || key === "request_id" ? (
              <Typography variant="body1">{record[key]}</Typography>
            ) : editingField === key ? (
              <TextField
                autoFocus
                fullWidth
                variant="outlined"
                value={editedValue !== null ? editedValue : record[key] || ""}
                onChange={(e) => setEditedValue(e.target.value)}
                onBlur={() => handleBlurOrEnter(key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleBlurOrEnter(key);
                  }
                }}
              />
            ) : (
              <Box display="flex" alignItems="center">
                <Typography variant="body1" sx={{ mr: 1 }}>
                  {record[key] && record[key].toString()}
                </Typography>
                <IconButton
                  onClick={() => {
                    setEditingField(key);
                    setEditedValue(record[key]);
                  }}
                  size="small"
                >
                  <EditIcon />
                </IconButton>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
          </Box>
        ))
      ) : (
        <Typography variant="body2">Загрузка данных...</Typography>
      )}
    </Box>
  );
}
