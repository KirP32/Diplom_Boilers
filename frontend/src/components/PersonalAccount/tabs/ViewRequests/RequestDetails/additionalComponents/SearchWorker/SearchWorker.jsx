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
  FormControl,
  Radio,
  IconButton,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Materials from "../Materials/Materials";
import $api from "../../../../../../../http";
import { useEffect } from "react";

import { FormControlLabel, FormLabel, RadioGroup } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { green } from "@mui/material/colors";

const modelOptionsMap = {
  3.1: [
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-301 кВт",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-251 кВт",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-200 кВт",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-400 кВт",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-127 кВт",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-1199 кВт",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-1060 кВт",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-800 кВт",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-660 кВт",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-500 кВт",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-145 кВт",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-200 кВт с контролем герметичности",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-251 кВт с контролем герметичности",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-301 кВт с контролем герметичности",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-400 кВт с контролем герметичности",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-500 кВт с контролем герметичности",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-660 кВт с контролем герметичности",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-800 кВт с контролем герметичности",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-1060 кВт с контролем герметичности",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-1199 кВт с контролем герметичности",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-1600 кВт с контролем герметичности",
    "Котел отопительный водогрейный типа GEFFEN MB 3.1-2000 кВт с контролем герметичности",
  ],
  4.1: [
    "Котел конденсационный газовый водогрейный типа GEFFEN MB 4.1-99",
    "Котел конденсационный газовый водогрейный типа GEFFEN MB 4.1-80",
    "Котел конденсационный газовый водогрейный типа GEFFEN MB 4.1-60",
    "Котел конденсационный газовый водогрейный типа GEFFEN MB 4.1-40",
  ],
};

export default function SearchWorker({
  access_level,
  sseEvent,
  fullItem,
  setFullItem,
  getData,
}) {
  const [data, setData] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [equipmentData, setEquipmentData] = useState([]);
  const [date, setDate] = useState("");
  useEffect(() => {
    $api.get(`/getRepairDate/${fullItem?.id}/repair`).then((res) => {
      setDate(res.data.date);
    });
  }, [fullItem?.id]);

  useEffect(() => {
    if (!sseEvent || !fullItem?.id) return;

    if (sseEvent.type === "repairDate_updated") {
      $api
        .get(`/getRepairDate/${fullItem.id}/repair`)
        .then((res) => setDate(res.data.date))
        .catch(console.error);
    }

    if (sseEvent.type === "equipment_updated") {
      $api
        .get(`/getEquipmentData/${fullItem.id}`)
        .then((res) => setData(res.data))
        .catch(console.error);
    }
  }, [sseEvent, fullItem?.id]);

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
      series: eq.series ?? "",
      model: eq.model ?? "",
      serial_number: eq.serial_number ?? "",

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
        name: d.defect_info,
        find_date: d.find_date,
        description: d.description ?? "",
        is_warranty_case: d.is_warranty_case,
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

  const handleDefectWarrantyChange = (equipmentIndex, defectId, isWarranty) => {
    setEquipmentData((prev) => {
      const copy = [...prev];
      const currentDescriptions = [...copy[equipmentIndex].defect_descriptions];

      const updatedDescriptions = currentDescriptions.map((desc) =>
        desc.id === defectId ? { ...desc, is_warranty_case: isWarranty } : desc
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
      .post("/confirmEquipmentData", {
        equipmentData,
        requestID: fullItem?.id,
      })
      .then(() => {
        setSnackbarOpen(true);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  const isReadOnly = access_level !== 3;
  const [isEditingDate, setIsEditingDate] = useState(false);

  const handleSave = async () => {
    try {
      await $api.post("/updateRepairDate", {
        repairDate: date,
        id: fullItem.id,
      });
      setIsEditingDate(false);
      getData();
    } catch (error) {
      console.error("Ошибка при сохранении даты:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 5, flexDirection: "column" }}>
      <Box sx={{ mx: "auto", maxWidth: 800, fontSize: 20 }}>
        {equipmentData?.map((eq, idx) => {
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
                  <FormControl fullWidth>
                    <InputLabel>Серия</InputLabel>
                    <Select
                      label="Серия"
                      value={local?.series}
                      onChange={(e) =>
                        isReadOnly
                          ? null
                          : handleFieldChange(idx, "series", e.target.value)
                      }
                    >
                      <MenuItem value="3.1">3.1</MenuItem>
                      <MenuItem value="4.1">4.1</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Модель</InputLabel>
                    <Select
                      label="Модель"
                      value={local.model}
                      onChange={(e) =>
                        isReadOnly
                          ? null
                          : handleFieldChange(idx, "model", e.target.value)
                      }
                    >
                      {modelOptionsMap[eq.series].map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Серийный номер"
                    value={local?.serial_number || ""}
                    onChange={(e) =>
                      isReadOnly
                        ? null
                        : handleFieldChange(
                            idx,
                            "serial_number",
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

                <Grid item xs={6}>
                  {isReadOnly ? (
                    <>
                      <TextField
                        label="Дата продажи оборудования"
                        value={local?.sale_date || ""}
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
                    </>
                  ) : (
                    <TextField
                      label="Дата продажи оборудования"
                      type="date"
                      value={local?.sale_date || ""}
                      onChange={(e) =>
                        isReadOnly
                          ? null
                          : handleFieldChange(idx, "sale_date", e.target.value)
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
                  )}
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Продавец оборудования"
                    value={local?.seller_name || ""}
                    onChange={(e) =>
                      isReadOnly
                        ? null
                        : handleFieldChange(idx, "seller_name", e.target.value)
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
                      isReadOnly
                        ? null
                        : handleFieldChange(
                            idx,
                            "article_number",
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
                <Grid item xs={6}>
                  {isReadOnly ? (
                    <TextField
                      label="Дата ввода в эксплуатацию"
                      value={local?.commissioning_date || ""}
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
                  ) : (
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
                  )}
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Документ реализации"
                    value={local?.document_number || ""}
                    onChange={(e) =>
                      isReadOnly
                        ? null
                        : handleFieldChange(
                            idx,
                            "document_number",
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
                <Grid item xs={6}>
                  <TextField
                    label="Организация ввода в эксплуатацию"
                    value={local?.commissioning_org || ""}
                    onChange={(e) =>
                      isReadOnly
                        ? null
                        : handleFieldChange(
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
                      isReadOnly
                        ? null
                        : handleFieldChange(
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
                      isReadOnly
                        ? null
                        : handleFieldChange(
                            idx,
                            "previous_repairs",
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

                {eq.defect_descriptions?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      История дефектов
                    </Typography>

                    {eq.defect_descriptions.map((d, di) => {
                      return (
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
                            <strong>{d.name}</strong> —{" "}
                            {new Date(d.find_date).toLocaleString("ru-RU", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </Typography>

                          <TextField
                            label="Описание неисправности"
                            value={d.description}
                            onChange={(e) =>
                              isReadOnly
                                ? null
                                : handleDefectDescriptionChange(
                                    idx,
                                    d.id,
                                    e.target.value
                                  )
                            }
                            fullWidth
                            multiline
                            minRows={2}
                            sx={{ mb: 2 }}
                          />

                          <FormControl component="fieldset">
                            <FormLabel component="legend">
                              Гарантийный случай?
                            </FormLabel>
                            <RadioGroup
                              row
                              value={String(d.is_warranty_case)}
                              onChange={(e) => {
                                if (!isReadOnly) {
                                  const val = e.target.value === "true";
                                  handleDefectWarrantyChange(idx, d.id, val);
                                }
                              }}
                            >
                              <FormControlLabel
                                value="false"
                                control={<Radio />}
                                label="Нет"
                              />
                              <FormControlLabel
                                value="true"
                                control={<Radio />}
                                label="Да"
                              />
                            </RadioGroup>
                          </FormControl>
                        </Box>
                      );
                    })}
                  </Grid>
                )}
              </Grid>
            </Paper>
          );
        })}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginTop: 2,
            gap: 2,
            justifyContent: "center",
          }}
        >
          <Typography variant="h5">Выполнить работы до:</Typography>
          <TextField
            type="date"
            value={date || ""}
            onChange={(e) => (!isReadOnly ? setDate(e.target.value) : null)}
            disabled={!isEditingDate}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { sx: { mr: 2 } },
            }}
            sx={{ width: 250 }}
          />
          {!isReadOnly && (
            <IconButton
              onClick={() => {
                if (isEditingDate) {
                  handleSave();
                } else {
                  setIsEditingDate(true);
                }
              }}
              sx={{ color: isEditingDate ? green[600] : "default" }}
            >
              {isEditingDate ? <CheckIcon /> : <EditIcon />}
            </IconButton>
          )}
        </Box>
        {!isReadOnly && (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => postEquipmentData(equipmentData)}
            >
              {"Подтвердить данные оборудования"}
            </Button>
          </Box>
        )}
      </Box>
      <Materials
        requestID={fullItem?.id}
        access_level={access_level}
        worker_region={fullItem?.worker_region}
        setSnackbarOpen={(e) => setSnackbarOpen(e)}
        fullItem={fullItem}
        setFullItem={(e) => setFullItem(e)}
        sseEvent={sseEvent}
        getData={getData}
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
