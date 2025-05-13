/* eslint-disable react/prop-types */
import { useState } from "react";
import { Box, Grid, Typography, Paper, TextField, Button } from "@mui/material";

// eslint-disable-next-line no-unused-vars
export default function SearchWorker({ access_level, item }) {
  const [equipmentData, setEquipmentData] = useState(
    item.equipments?.map((eq) => ({
      id: eq.id,
      sale_date: "",
      seller_name: "",
      commissioning_date: "",
      commissioning_org: "",
      commissioning_master: "",
      previous_repairs: "",
      article_number: "",
      document_number: "",
      new_defect: "",
      defect_descriptions: eq.defects?.reduce((acc, d) => {
        acc[d.id] = "";
        return acc;
      }, {}),
    })) || []
  );

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
      const current = { ...copy[equipmentIndex] };

      copy[equipmentIndex] = {
        ...current,
        defect_descriptions: {
          ...current.defect_descriptions,
          [defectId]: value,
        },
      };

      return copy;
    });
  };

  return (
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
                  value={eq.series}
                  slotProps={{ readOnly: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Модель"
                  value={eq.model}
                  slotProps={{ readOnly: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Серийный номер"
                  value={eq.serial_number}
                  slotProps={{ readOnly: true }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Дата продажи оборудования"
                  type="date"
                  value={local.sale_date}
                  onChange={(e) =>
                    handleFieldChange(idx, "sale_date", e.target.value)
                  }
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Продавец оборудования"
                  value={local.seller_name}
                  onChange={(e) =>
                    handleFieldChange(idx, "seller_name", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Артикул"
                  value={local.article_number}
                  onChange={(e) =>
                    handleFieldChange(idx, "article_number", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Дата ввода в эксплуатацию"
                  type="date"
                  value={local.sale_date}
                  onChange={(e) =>
                    handleFieldChange(idx, "sale_date", e.target.value)
                  }
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Документ реализации"
                  value={local.document_number}
                  onChange={(e) =>
                    handleFieldChange(idx, "document_number", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Организация ввода в эксплуатацию"
                  value={local.commissioning_org}
                  onChange={(e) =>
                    handleFieldChange(idx, "commissioning_org", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Мастер ввода в эксплуатацию"
                  value={local.commissioning_master}
                  onChange={(e) =>
                    handleFieldChange(
                      idx,
                      "commissioning_master",
                      e.target.value
                    )
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Предыдущие ремонты"
                  multiline
                  minRows={2}
                  value={local.previous_repairs}
                  onChange={(e) =>
                    handleFieldChange(idx, "previous_repairs", e.target.value)
                  }
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
                          equipmentData[idx].defect_descriptions[d.id] || ""
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

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => console.log("Отправить все данные", equipmentData)}
        >
          Отправить все данные
        </Button>
      </Box>
    </Box>
  );
}
