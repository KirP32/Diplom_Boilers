import { useState, useEffect, useRef } from "react";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import {
  Button,
  Collapse,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./PhotoFolder.module.scss";
import DeleteIcon from "@mui/icons-material/Delete";
import $api from "../../../../../../../http";
export default function PhotoFolder({ requestID }) {
  const [photoOpen, setPhotoOpen] = useState(false);
  const [drag, setDrag] = useState(false);
  const [files, setFiles] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");

  const urlRef = useRef([]);

  useEffect(() => {
    return () => {
      urlRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlRef.current = [];
    };
  }, []);

  const addFiles = (incomingFiles) => {
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
    if (e.target.files) addFiles(e.target.files);
  };

  const openPreview = (src) => () => {
    setPreviewSrc(src);
    setPreviewOpen(true);
  };
  const closePreview = () => {
    setPreviewOpen(false);
  };

  const handleDialogExited = () => {
    URL.revokeObjectURL(previewSrc);
    setPreviewSrc("");
  };

  const removeFile = (idx) => {
    setFiles((prev) => {
      const toRevoke = prev[idx].url;
      URL.revokeObjectURL(toRevoke);
      urlRef.current = urlRef.current.filter((u) => u !== toRevoke);
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  };
  async function handleClickSendPhoto() {
    const formData = new FormData();

    files.forEach(({ file }) => {
      formData.append("files", file);
    });

    formData.append("requestID", requestID);
    // formData.append("category", category);

    try {
      await $api.post("/uploadPhoto", formData);
      setFiles({});
    } catch (error) {
      console.error("Ошибка при отправке фото:", error);
    }
  }

  return (
    <div className="photo_body_wrapper" style={{ paddingBottom: "10px" }}>
      <PhotoLibraryIcon
        fontSize="large"
        onClick={() => setPhotoOpen((open) => !open)}
        style={{ cursor: "pointer" }}
      />
      <Collapse in={photoOpen}>
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
              {files.map(({ file, url }, idx) => (
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
                    onClick={() => removeFile(idx)}
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

      <Dialog
        open={previewOpen}
        onClose={closePreview}
        onExited={handleDialogExited}
        maxWidth="lg"
      >
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
