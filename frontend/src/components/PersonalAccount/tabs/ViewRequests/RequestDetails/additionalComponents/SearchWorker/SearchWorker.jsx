/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import Materials from "../Materials/Materials";
import $api from "../../../../../../../http";
import { useEffect } from "react";

// eslint-disable-next-line no-unused-vars
export default function SearchWorker({ access_level, item, fullItem }) {
  const [data, setData] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [equipmentData, setEquipmentData] = useState([]);

  useEffect(() => {
    if (!fullItem?.id) return;
    $api
      .get(`/getEquipmentData/${fullItem.id}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [fullItem?.id]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setEquipmentData([]);
      return;
    }

    const init = data.map((eq) => ({
      id: eq.id,
      series: eq.series,
      model: eq.model,
      serial_number: eq.serial_number,

      sale_date: eq.sale_date ? eq.sale_date.slice(0, 10) : "",

      seller_name: eq?.seller ?? "",
      commissioning_date: eq.commissioning_date
        ? eq.commissioning_date.slice(0, 10)
        : "",
      commissioning_org: eq?.commissioning_org ?? "",
      commissioning_master: eq?.commissioning_master ?? "",
      previous_repairs: eq?.previous_repairs ?? "",
      article_number: eq?.article_number ?? "",
      document_number: eq?.sale_document ?? "",

      defect_descriptions: (eq?.defects || []).map((d) => ({
        id: d.id,
        description: d.description ?? "",
      })),
    }));

    setEquipmentData(init);
  }, [data]);

  const handleFieldChange = (idx, field, value) => {
    setEquipmentData((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleDefectDescriptionChange = (equipmentIndex, defectId, value) => {
    setEquipmentData((prev) => {
      const copy = [...prev];
      const currentDescriptions = [...copy[equipmentIndex].defect_descriptions];

      const updatedDescriptions = currentDescriptions.map((desc) =>
        desc.id === defectId ? { ...desc, description: value } : desc
      );

      copy[equipmentIndex] = {
        ...copy[equipmentIndex],
        defect_descriptions: updatedDescriptions,
      };

      return copy;
    });
  };

  async function postEquipmentData() {
    $api
      .post("/confirmEquipmentData", equipmentData)
      .catch((err) => {
        console.log(err);
      })
      .then(() => {
        setSnackbarOpen(true);
      });
  }
  return (
    <Box sx={{ display: "flex", gap: 5, flexDirection: "column" }}>
      <Box sx={{ mx: "auto", maxWidth: 800, fontSize: 20 }}>
        {item.equipments?.map((eq, idx) => {
          const local = equipmentData[idx];
          return (
            <Paper
              key={eq.id}
              variant="outlined"
              sx={{ p: 2, mt: 3, borderRadius: 2 }}
            >
              <Typography variant="h6" gutterBottom>
                <strong>Оборудование #{idx + 1}</strong>
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    label="Серия"
                    value={eq.series || ""}
                    slotProps={{ readOnly: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Модель"
                    value={eq.model || ""}
                    slotProps={{ readOnly: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Серийный номер"
                    value={eq.serial_number || ""}
                    slotProps={{ readOnly: true }}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Дата продажи оборудования"
                    type="date"
                    value={local?.sale_date || ""}
                    onChange={(e) =>
                      handleFieldChange(idx, "sale_date", e.target.value)
                    }
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                      htmlInput: {
                        sx: { mr: 2 },
                      },
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Продавец оборудования"
                    value={local?.seller_name || ""}
                    onChange={(e) =>
                      handleFieldChange(idx, "seller_name", e.target.value)
                    }
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: { sx: { mr: 2 } },
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Артикул"
                    value={local?.article_number || ""}
                    onChange={(e) =>
                      handleFieldChange(idx, "article_number", e.target.value)
                    }
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: { sx: { mr: 2 } },
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Дата ввода в эксплуатацию"
                    type="date"
                    value={local?.commissioning_date || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        idx,
                        "commissioning_date",
                        e.target.value
                      )
                    }
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                      htmlInput: {
                        sx: { mr: 2 },
                      },
                    }}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Документ реализации"
                    value={local?.document_number || ""}
                    onChange={(e) =>
                      handleFieldChange(idx, "document_number", e.target.value)
                    }
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: { sx: { mr: 2 } },
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Организация ввода в эксплуатацию"
                    value={local?.commissioning_org || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        idx,
                        "commissioning_org",
                        e.target.value
                      )
                    }
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: { sx: { mr: 2 } },
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Мастер ввода в эксплуатацию"
                    value={local?.commissioning_master || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        idx,
                        "commissioning_master",
                        e.target.value
                      )
                    }
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: { sx: { mr: 2 } },
                    }}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Предыдущие ремонты"
                    multiline
                    minRows={2}
                    value={local?.previous_repairs || ""}
                    onChange={(e) =>
                      handleFieldChange(idx, "previous_repairs", e.target.value)
                    }
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: { sx: { mr: 2 } },
                    }}
                    fullWidth
                  />
                </Grid>

                {eq.defects?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      История дефектов
                    </Typography>

                    {eq.defects.map((d, di) => (
                      <Box
                        key={di}
                        sx={{
                          border: "1px dashed #bbb",
                          borderRadius: 1,
                          p: 2,
                          mb: 2,
                        }}
                      >
                        <Typography sx={{ mb: 1 }}>
                          <b>{d.find_date}</b> — {d.defect_info}
                        </Typography>

                        <TextField
                          label="Описание неисправности"
                          value={
                            equipmentData[idx]?.defect_descriptions.find(
                              (dd) => dd.id === d.id
                            )?.description || ""
                          }
                          onChange={(e) =>
                            handleDefectDescriptionChange(
                              idx,
                              d.id,
                              e.target.value
                            )
                          }
                          fullWidth
                          multiline
                          minRows={2}
                        />
                      </Box>
                    ))}
                  </Grid>
                )}

                {/* <Grid item xs={12}>
                <TextField
                  label="Новый дефект"
                  value={local.new_defect}
                  onChange={(e) =>
                    handleFieldChange(idx, "new_defect", e.target.value)
                  }
                  fullWidth
                />
              </Grid> */}

                {/* <Grid item xs={12} textAlign="right">
                <Button
                  variant="contained"
                  onClick={() =>
                    console.log(
                      "Сохранить данные для оборудования",
                      eq.id,
                      local
                    )
                  }
                >
                  Сохранить
                </Button>
              </Grid> */}
              </Grid>
            </Paper>
          );
        })}

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => postEquipmentData(equipmentData)}
          >
            Подтвердить данные оборудования
          </Button>
        </Box>
      </Box>
      <Materials
        requestID={fullItem?.id}
        access_level={access_level}
        worker_username={fullItem?.worker_username}
        worker_region={fullItem?.worker_region}
        setSnackbarOpen={(e) => setSnackbarOpen(e)}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => {
          setSnackbarOpen(false);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={"success"}
          onClose={() => {
            setSnackbarOpen(false);
          }}
        >
          {"Данные обновлены"}
        </Alert>
      </Snackbar>
    </Box>
  );
}
