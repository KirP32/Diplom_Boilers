/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useCallback } from "react";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import {
  Button,
  Collapse,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./PhotoFolder.module.scss";
import DeleteIcon from "@mui/icons-material/Delete";
import $api from "../../../../../../../http";

const CATEGORIES = [
  { value: "defects", label: "Неисправности" },
  { value: "nameplates", label: "Шильдики котлов" },
  { value: "report", label: "Отчёт о ремонте" },
  { value: "request", label: "Фото заявки" },
];

export default function PhotoFolder({ requestID }) {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].value);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [drag, setDrag] = useState(false);
  const [files, setFiles] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [urlsByCategory, setUrlsByCategory] = useState({
    defects: [],
    nameplates: [],
    report: [],
    request: [],
  });
  const urlRef = useRef([]);

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await $api.get(`/getRequestPhoto/${requestID}`);
      setUrlsByCategory((prev) => ({
        ...prev,
        ...res.data,
      }));
    } catch (err) {
      console.log(err);
    }
  }, [requestID]);

  useEffect(() => {
    if (requestID) fetchPhotos();
  }, [requestID, fetchPhotos]);

  useEffect(() => {
    return () => {
      urlRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlRef.current = [];
    };
  }, []);

  const addFiles = (incomingFiles) => {
    console.log(incomingFiles);
    const images = Array.from(incomingFiles).filter((f) =>
      f.type.startsWith("image/")
    );
    const withUrls = images.map((file) => {
      const url = URL.createObjectURL(file);
      urlRef.current.push(url);
      return { file, url };
    });
    setFiles((prev) => [...prev, ...withUrls]);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDrag(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
    setDrag(false);
  };
  const handleFileChange = (e) => {
    if (e.target.files) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const openPreview = (src) => () => {
    setPreviewSrc(src);
    setPreviewOpen(true);
  };
  const closePreview = () => {
    setPreviewOpen(false);
  };

  async function handleClickSendPhoto() {
    const formData = new FormData();
    formData.append("category", selectedCategory);

    files.forEach(({ file }) => {
      formData.append("files", file);
    });

    try {
      const response = await $api.post(`/uploadPhoto/${requestID}`, formData);

      setUrlsByCategory((prev) => ({
        ...prev,
        [selectedCategory]: [
          ...prev[selectedCategory],
          ...response.data.photos.map(({ id, url, original_name }) => ({
            id,
            url,
            original_name,
          })),
        ],
      }));

      setFiles([]);
    } catch (error) {
      console.error("Ошибка при загрузке фото:", error);
    }
  }
  async function removePhoto(id, original_name) {
    try {
      await $api.delete(`/deletePhoto/${requestID}/${id}/${original_name}`);

      setUrlsByCategory((prev) => ({
        ...prev,
        [selectedCategory]: prev[selectedCategory].filter(
          (photo) => photo.id !== id
        ),
      }));
    } catch (error) {
      console.error("Ошибка при удалении фото:", error);
    }
  }
  function removePhotoLocal(fileToRemove, fileUrl) {
    setFiles((prev) => {
      const updated = prev.filter(({ url }) => url !== fileUrl);

      URL.revokeObjectURL(fileToRemove.url);

      return updated;
    });
  }

  return (
    <div className="photo_body_wrapper" style={{ paddingBottom: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <PhotoLibraryIcon
          fontSize="large"
          onClick={() => setPhotoOpen((open) => !open)}
          style={{ cursor: "pointer" }}
        />
      </div>
      <Collapse in={photoOpen} sx={{ mt: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
          <InputLabel>Категория фото</InputLabel>
          <Select
            value={selectedCategory}
            label="Категория фото"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {CATEGORIES.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {urlsByCategory[selectedCategory]?.length > 0 && (
          <div className={styles.preview_grid}>
            {urlsByCategory[selectedCategory].map(
              ({ url, id, original_name }) => (
                <div key={url} className={styles.thumb_wrapper}>
                  <img
                    src={url}
                    alt="image"
                    className={styles.thumb}
                    onClick={openPreview(url)}
                  />
                  <IconButton
                    size="small"
                    className={styles.delete_btn}
                    onClick={() => removePhoto(id, original_name)}
                    style={{ color: "red", zIndex: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              )
            )}
          </div>
        )}

        <div className={styles.drop_area}>
          {drag ? (
            <div
              className={styles.dashed}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              Отпустите фотографии, чтобы загрузить
            </div>
          ) : (
            <div
              className={styles.dashed}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              Перетащите фотографии, чтобы загрузить
            </div>
          )}
          <h5>Или</h5>
          <label className={styles.label_form} htmlFor="file_upload">
            Выбрать фото
          </label>
          <input
            id="file_upload"
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        {files.length > 0 && (
          <>
            <div className={styles.preview_grid}>
              {files.map(({ file, url }) => (
                <div key={url} className={styles.thumb_wrapper}>
                  <img
                    src={url}
                    alt={file.name}
                    className={styles.thumb}
                    onClick={openPreview(url)}
                  />
                  <IconButton
                    size="small"
                    className={styles.delete_btn}
                    onClick={() => removePhotoLocal(file, url)}
                    style={{ color: "red", zIndex: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: "10px",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleClickSendPhoto}
              >
                Загрузить фото
              </Button>
            </div>
          </>
        )}
      </Collapse>

      <Dialog open={previewOpen} onClose={closePreview} maxWidth="lg">
        <DialogContent sx={{ position: "relative", p: 0 }}>
          <IconButton
            onClick={closePreview}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#fff",
              zIndex: 10,
              background: "rgba(0,0,0,0.6)",
            }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={previewSrc}
            alt="preview"
            style={{ width: "100%", height: "auto" }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
