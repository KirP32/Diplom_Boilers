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
  IconButton,
  CircularProgress,
} from "@mui/material";
import { ThemeContext } from "../../../../Theme";
import PhoneInput from "../../additionalComponents/PhoneInput/PhoneInput";
import $api from "../../../../http";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoFolder from "./PhotoPholder/PhotoPholder";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";

const token = "98be28db4ed79229bc269503c6a4d868e628b318";

export default function CreateRequests({ deviceObject, setSelectedTab }) {
  const { access_level } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);

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

  const [problem, setProblem] = useState("");
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
    { series: "3.1", model: "", serial_number: "", description: "", date: "" },
  ]);
  const [photoFiles, setPhotoFiles] = useState({
    defects: [],
    nameplates: [],
    report: [],
    request: [],
  });

  useEffect(() => {
    $api
      .get("/getWattsonEmployee")
      .then((res) => setDataEmployees(res.data))
      .catch(() => setDataEmployees({ wattson: [], worker: [] }));
  }, []);

  function clearForm() {
    setProblem("");
    setDescription("");
    setWattsonWorker("");
    setAscWorker("");
    setPhone("");
    setAddresValue("");
    setFullname("");
    setDefects([
      {
        series: "3.1",
        model: "",
        serial_number: "",
        description: "",
        date: "",
      },
    ]);
    setPhotoFiles({ defects: [], nameplates: [], report: [], request: [] });
  }

  function validate() {
    return (
      problem.trim() &&
      phone.length === 12 &&
      defects.every(
        (d) =>
          d.series &&
          d.model &&
          d.serial_number.trim() &&
          d.date &&
          d.description.trim()
      )
    );
  }

  const debounceRef = useRef(null);
  function handleInputChange(newInputValue) {
    if (newInputValue !== addressValue) {
      setAddresValue(newInputValue);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(
        () => handleLegalAddress(newInputValue),
        500
      );
    }
  }
  async function handleLegalAddress(query) {
    try {
      const result = await axios.post(
        "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
        { query, count: 7 },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );
      setAddressList(
        result.data.suggestions.map((item) => ({
          label: item.value,
          unrestricted_value: item.unrestricted_value,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  }
  function handleChange(event, newValue) {
    if (typeof newValue === "string") setAddresValue(newValue);
  }
  async function handleSuggestClick() {
    try {
      const res = await $api.get("/getRequestName");
      setProblem(res.data.freeName);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateRequest() {
    if (!validate()) return;
    setLoading(true);
    const payload = {
      problem_name: problem,
      created_by: jwtDecode(
        localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken")
      ).login,
      description,
      system_name: deviceObject.name,
      phone,
      created_by_worker: access_level !== 0,
      access_level,
      assigned_to_wattson: wattsonWorker || null,
      assigned_to_worker: ascWorker || null,
      defects,
      addressValue,
      fullname,
    };
    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));
    Object.entries(photoFiles).forEach(([cat, files]) =>
      files.forEach((f) => f instanceof File && formData.append(cat, f, f.name))
    );
    try {
      await $api.post("/createRequest", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccessFlag(true);
      clearForm();
      setTimeout(() => setSuccessFlag(false), 10000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function addDefect() {
    setDefects((prev) => [
      ...prev,
      {
        series: "3.1",
        model: "",
        serial_number: "",
        description: "",
        date: "",
      },
    ]);
  }
  function removeDefect(idx) {
    setDefects((prev) => prev.filter((_, i) => i !== idx));
  }

  const handleDefectChange = (idx, field, value) => {
    setDefects((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      if (field === "series") copy[idx].model = "";
      return copy;
    });
  };
  return (
    <Box sx={{ p: 2, mx: "auto", position: "relative" }}>
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(255,255,255,0.7)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      )}
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
          <strong>Создание заявки</strong>
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={4}>
            <Box sx={{ display: "flex" }}>
              <Typography>Название заявки</Typography>
              <IconButton onClick={handleSuggestClick}>
                <HelpCenterIcon color="primary" />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth
              variant="outlined"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              error={!problem.trim()}
              helperText={!problem.trim() && "Укажите название"}
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
              options={address_list.map((o) => o.unrestricted_value)}
              filterOptions={(opts) => opts}
              onInputChange={(e, val) => handleInputChange(val)}
              onChange={handleChange}
              renderInput={(params) => <TextField {...params} label="Адрес" />}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography>Номер для связи</Typography>
          </Grid>
          <Grid item xs={8}>
            <PhoneInput
              phone={phone}
              onPhoneChange={setPhone}
              style={{ width: "100%", fontSize: "20px" }}
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
                  <Grid item xs={3}>
                    <Typography>Серия</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth>
                      <InputLabel>Серия</InputLabel>
                      <Select
                        label="Серия"
                        value={d.series}
                        onChange={(e) => {
                          handleDefectChange(idx, "series", e.target.value);
                        }}
                      >
                        <MenuItem value="3.1">3.1</MenuItem>
                        <MenuItem value="4.1">4.1</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
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
                  <Grid item xs={1} sx={{ textAlign: "right" }}>
                    <IconButton onClick={() => removeDefect(idx)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography>Серийный номер</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField
                      fullWidth
                      label="Серийный номер"
                      value={d.serial_number}
                      onChange={(e) =>
                        handleDefectChange(idx, "serial_number", e.target.value)
                      }
                    />
                  </Grid>
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
                  <Grid item xs={3}>
                    <Typography>Дата обнаружения</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <TextShowPicker
                      d={d}
                      idx={idx}
                      handleDefectChange={handleDefectChange}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
          <Grid item xs={12}>
            <MuiButton variant="outlined" onClick={addDefect}>
              Добавить дефект
            </MuiButton>
          </Grid>
          <Grid item xs={4}>
            <PhotoFolder
              title="Неисправности"
              files={photoFiles.defects}
              onChange={(newFiles) =>
                setPhotoFiles((prev) => ({ ...prev, defects: newFiles }))
              }
            />
            <PhotoFolder
              title="Шильдики котлов"
              files={photoFiles.nameplates}
              onChange={(newFiles) =>
                setPhotoFiles((prev) => ({ ...prev, nameplates: newFiles }))
              }
            />
            <PhotoFolder
              title="Отчёт о ремонте"
              files={photoFiles.report}
              onChange={(newFiles) =>
                setPhotoFiles((prev) => ({ ...prev, report: newFiles }))
              }
            />
            <PhotoFolder
              title="Фото заявки"
              files={photoFiles.request}
              onChange={(newFiles) =>
                setPhotoFiles((prev) => ({ ...prev, request: newFiles }))
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
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
          <Grid item xs={4}>
            <Typography>Назначить WATTSON</Typography>
          </Grid>
          <Grid item xs={8}>
            <FormControl fullWidth>
              <InputLabel>WATTSON</InputLabel>
              <Select
                label="WATTSON"
                value={wattsonWorker}
                onChange={(e) => setWattsonWorker(e.target.value)}
              >
                <MenuItem value="">Нет</MenuItem>
                {dataEmployees?.wattson.map((u) => (
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
          <Grid item xs={4}>
            <Typography>Назначить АСЦ</Typography>
          </Grid>
          <Grid item xs={8}>
            <FormControl fullWidth>
              <InputLabel>АСЦ</InputLabel>
              <Select
                label="АСЦ"
                value={ascWorker}
                onChange={(e) => setAscWorker(e.target.value)}
              >
                <MenuItem value="">Нет</MenuItem>
                {dataEmployees?.worker.map((u) => (
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
            disabled={!validate() || loading}
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

function TextShowPicker({ d, handleDefectChange, idx }) {
  const inputRef = useRef();
  return (
    <TextField
      fullWidth
      type="date"
      inputRef={inputRef}
      onClick={() => inputRef.current?.showPicker()}
      value={d.date}
      onChange={(e) => handleDefectChange(idx, "date", e.target.value)}
    />
  );
}
