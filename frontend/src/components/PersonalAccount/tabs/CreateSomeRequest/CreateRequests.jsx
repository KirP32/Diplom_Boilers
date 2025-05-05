/* eslint-disable react/prop-types */
import { Fragment, useContext, useEffect, useRef, useState } from "react";
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
} from "@mui/material";
import { ThemeContext } from "../../../../Theme";
import PhoneInput from "../../additionalComponents/PhoneInput/PhoneInput";
import $api from "../../../../http";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
const token = "98be28db4ed79229bc269503c6a4d868e628b318";

export default function CreateRequests({ deviceObject, setSelectedTab }) {
  const { access_level } = useContext(ThemeContext);

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
  const deviceOptions = [
    ...deviceObject.boilers,
    { s_number: "Другое", type: 0 },
    { s_number: "Котёл МВ 3", type: 0 },
    { s_number: "Котёл МВ 4", type: 0 },
  ];
  const [defects, setDefects] = useState([{ description: "", date: "" }]);
  const handleDefectChange = (index, field, value) => {
    setDefects((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addDefectRow = () => {
    setDefects((prev) => [...prev, { description: "", date: "" }]);
  };

  const removeDefectRow = (index) => {
    setDefects((prev) => prev.filter((_, i) => i !== index));
  };

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
  }

  function validate() {
    return problem.trim() && phone.length === 12;
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

          {/* Модуль */}
          <Grid item xs={4}>
            <Typography>Проблема с</Typography>
          </Grid>
          <Grid item xs={8}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Модуль</InputLabel>
              <Select
                label="Модуль"
                value={moduleObj.s_number}
                onChange={(e) =>
                  setModuleObj(
                    deviceOptions.find((o) => o.s_number === e.target.value)
                  )
                }
              >
                {deviceOptions.map((opt) => (
                  <MenuItem key={opt.s_number} value={opt.s_number}>
                    {opt.s_number}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Список дефектов</Typography>
          </Grid>
          {defects.map((defect, idx) => (
            <Fragment key={idx}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Описание дефекта"
                  variant="outlined"
                  value={defect.description}
                  onChange={(e) =>
                    handleDefectChange(idx, "description", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Дата обнаружения"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  value={defect.date}
                  onChange={(e) =>
                    handleDefectChange(idx, "date", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={2} textAlign="center">
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => removeDefectRow(idx)}
                  disabled={defects.length === 1}
                >
                  Удалить
                </Button>
              </Grid>
            </Fragment>
          ))}
          <Grid item xs={12}>
            <Button variant="outlined" onClick={addDefectRow}>
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
