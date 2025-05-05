/* eslint-disable react/prop-types */
import { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button as MuiButton,
  Autocomplete,
  Button,
  IconButton,
} from "@mui/material";
import { ThemeContext } from "../../../../Theme";
import PhoneInput from "../../additionalComponents/PhoneInput/PhoneInput";
import $api from "../../../../http";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
const token = "98be28db4ed79229bc269503c6a4d868e628b318";
import DeleteIcon from "@mui/icons-material/Delete";

export default function CreateRequests({ deviceObject, setSelectedTab }) {
  const { access_level } = useContext(ThemeContext);
  const seriesOptions = [
    { value: "3.1", label: "MB 3.1" },
    { value: "4.1", label: "MB 4.1" },
  ];
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
      // с контролем герметичности
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

  const [problem, setProblem] = useState("");
  const [moduleObj, setModuleObj] = useState({ s_number: "Другое", type: 0 });
  const [description, setDescription] = useState("");
  const [wattsonWorker, setWattsonWorker] = useState("");
  const [ascWorker, setAscWorker] = useState("");
  const [phone, setPhone] = useState("");
  const [successFlag, setSuccessFlag] = useState(false);
  const [dataEmployees, setDataEmployees] = useState(null);
  const [fullname, setFullname] = useState("");
  const [addressValue, setAddresValue] = useState("");
  const [address_list, setAddressList] = useState([]);
  const [defects, setDefects] = useState([
    { series: "3.1", model: "", serial: "", description: "", date: "" },
  ]);
  const handleDefectChange = (idx, field, value) => {
    setDefects((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      if (field === "series") copy[idx].model = "";
      return copy;
    });
  };

  const addDefect = () =>
    setDefects((prev) => [
      ...prev,
      { series: "3.1", model: "", serial: "", description: "", date: "" },
    ]);

  const removeDefect = (idx) =>
    setDefects((prev) => prev.filter((_, i) => i !== idx));

  useEffect(() => {
    $api
      .get("/getWattsonEmployee")
      .then((res) => setDataEmployees(res.data))
      .catch(() => setDataEmployees({ wattson: [], worker: [] }));
  }, []);

  function clearForm() {
    setProblem("");
    setModuleObj({ s_number: "Другое", type: 0 });
    setDescription("");
    setWattsonWorker("");
    setAscWorker("");
    setPhone("");
    setAddresValue("");
    setDefects([
      { series: "3.1", model: "", serial: "", description: "", date: "" },
    ]);
  }

  function validate() {
    return (
      problem.trim() &&
      phone.length === 12 &&
      defects.every(
        (d) =>
          d.series &&
          d.model &&
          d.serial.trim() !== "" &&
          d.date &&
          d.description.trim() !== ""
      )
    );
  }

  function handleCreateRequest() {
    if (!validate()) return;
    const data = {
      problem_name: problem,
      module: moduleObj.s_number,
      created_by: jwtDecode(localStorage.getItem("accessToken") || "").login,
      description,
      system_name: deviceObject.name,
      phone,
      type: moduleObj.type,
      created_by_worker: access_level !== 0,
      access_level,
      assigned_to_wattson: wattsonWorker || null,
      assigned_to_worker: ascWorker || null,
      defects,
      addressValue,
    };
    $api.post("/createRequest", data).then(() => {
      setSuccessFlag(true);
      setTimeout(() => setSuccessFlag(false), 5000);
      clearForm();
    });
  }
  const debounceRef = useRef(null);
  function handleInputChange(newInputValue) {
    if (newInputValue !== addressValue) {
      setAddresValue(newInputValue);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        handleLegalAddress(newInputValue);
      }, 500);
    }
  }

  function handleChange(event, newValue) {
    if (newValue && typeof newValue === "string") {
      setAddresValue(newValue);
    }
  }
  async function handleLegalAddress(query) {
    try {
      const result = await axios({
        method: "POST",
        url: "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${token}`,
        },
        data: { query, count: 7 },
      });
      let temp_list = [];
      result.data.suggestions.forEach((item) =>
        temp_list.push({
          label: item.value,
          unrestricted_value: item.unrestricted_value,
        })
      );
      setAddressList(temp_list);
    } catch (error) {
      console.log(error.response ? error.response.data : error);
    }
  }
  return (
    <Box sx={{ p: 2, mx: "auto" }}>
      <Paper
        elevation={1}
        sx={{
          p: 3,
          bgcolor: "background.paper",
          color: "text.primary",
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          <strong> Создание заявки</strong>
        </Typography>

        <Grid container spacing={2} alignItems="center">
          {/* Проблема */}
          <Grid item xs={4}>
            <Typography>Ваша проблема</Typography>
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth
              variant="outlined"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              error={!problem.trim()}
              helperText={!problem.trim() && "Укажите проблему"}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={4}>
            <Typography>ФИО контактного лица</Typography>
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth
              variant="outlined"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
          </Grid>

          <Grid item xs={4}>
            <Typography>Адресс объекта с неисправным оборудованием</Typography>
          </Grid>
          <Grid item xs={8}>
            <Autocomplete
              freeSolo
              value={addressValue}
              options={address_list}
              filterOptions={(options) => options}
              onInputChange={(event, newInputValue) =>
                handleInputChange(newInputValue)
              }
              onChange={(event, newValue) => handleChange(event, newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Адрес" autoFocus />
              )}
            />
          </Grid>

          {/* Телефон */}
          <Grid item xs={4}>
            <Typography>Номер для связи</Typography>
          </Grid>
          <Grid item xs={8}>
            <PhoneInput
              phone={phone}
              onPhoneChange={setPhone}
              style={{ width: "100%", fontSize: "20px", position: "relative" }}
            />
            {phone.length !== 12 && (
              <Typography color="error" variant="caption">
                Неправильный номер
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={4}>
            <Typography variant="h6">Список дефектов оборудования</Typography>
          </Grid>
          {defects.map((d, idx) => (
            <Grid item xs={12} key={idx}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  {/* Серия */}
                  <Grid item xs={3}>
                    <Typography>Серия</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth>
                      <InputLabel>Серия</InputLabel>
                      <Select
                        label="Серия"
                        value={d.series}
                        onChange={(e) =>
                          handleDefectChange(idx, "series", e.target.value)
                        }
                      >
                        <MenuItem value="3.1">3.1</MenuItem>
                        <MenuItem value="4.1">4.1</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Модель */}
                  <Grid item xs={5}>
                    <FormControl fullWidth>
                      <InputLabel>Модель</InputLabel>
                      <Select
                        label="Модель"
                        value={d.model}
                        onChange={(e) =>
                          handleDefectChange(idx, "model", e.target.value)
                        }
                      >
                        {modelOptionsMap[d.series].map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Кнопка удаления */}
                  <Grid item xs={1} sx={{ textAlign: "right" }}>
                    <IconButton onClick={() => removeDefect(idx)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Grid>

                  {/* Серийный номер */}
                  <Grid item xs={3}>
                    <Typography>Серийный номер</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField
                      fullWidth
                      label="Серийный номер"
                      value={d.serial}
                      onChange={(e) =>
                        handleDefectChange(idx, "serial", e.target.value)
                      }
                    />
                  </Grid>

                  {/* Описание дефекта */}
                  <Grid item xs={3}>
                    <Typography>Описание дефекта</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField
                      fullWidth
                      label="Описание"
                      value={d.description}
                      onChange={(e) =>
                        handleDefectChange(idx, "description", e.target.value)
                      }
                    />
                  </Grid>

                  {/* Дата обнаружения */}
                  <Grid item xs={3}>
                    <Typography>Дата обнаружения</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField
                      fullWidth
                      type="date"
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                      value={d.date}
                      onChange={(e) =>
                        handleDefectChange(idx, "date", e.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button variant="outlined" onClick={addDefect}>
              Добавить дефект
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Подробности */}
          <Grid item xs={4}>
            <Typography>Подробности</Typography>
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Назначить WATTSON */}
          <Grid item xs={4}>
            <Typography>Назначить WATTSON</Typography>
          </Grid>
          <Grid item xs={8}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>WATTSON</InputLabel>
              <Select
                label="WATTSON"
                value={wattsonWorker}
                onChange={(e) => setWattsonWorker(e.target.value)}
              >
                <MenuItem value="">Нет</MenuItem>
                {dataEmployees?.wattson?.map((u) => (
                  <MenuItem key={u.id} value={u.username}>
                    {u.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Назначить АСЦ */}
          <Grid item xs={4}>
            <Typography>Назначить АСЦ</Typography>
          </Grid>
          <Grid item xs={8}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>АСЦ</InputLabel>
              <Select
                label="АСЦ"
                value={ascWorker}
                onChange={(e) => setAscWorker(e.target.value)}
              >
                <MenuItem value="">Нет</MenuItem>
                {dataEmployees?.worker?.map((u) => (
                  <MenuItem key={u.id} value={u.username}>
                    {u.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>
        </Grid>

        <Box textAlign="center" mt={3}>
          <MuiButton
            variant="contained"
            color="primary"
            onClick={handleCreateRequest}
            disabled={!validate()}
          >
            Создать
          </MuiButton>
        </Box>

        {successFlag && (
          <Box mt={2} textAlign="center">
            <Typography color="success.main">
              Заявка успешно создана!
            </Typography>
            <MuiButton onClick={setSelectedTab}>Перейти к списку</MuiButton>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
