/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
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
} from "@mui/material";
import { ThemeContext } from "../../../../Theme";
import PhoneInput from "../../additionalComponents/PhoneInput/PhoneInput";
import $api from "../../../../http";
import { jwtDecode } from "jwt-decode";

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

  const deviceOptions = [
    ...deviceObject.boilers,
    { s_number: "Другое", type: 0 },
    { s_number: "Котёл МВ 3", type: 0 },
    { s_number: "Котёл МВ 4", type: 0 },
  ];

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
    };
    $api.post("/createRequest", data).then(() => {
      setSuccessFlag(true);
      setTimeout(() => setSuccessFlag(false), 5000);
      clearForm();
    });
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
