/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function PhotoFolder({ title, files, onChange }) {
  const [dragOver, setDragOver] = useState(false);
  const urlRef = useRef([]);

  useEffect(() => {
    const urls = [...urlRef.current];
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const addFiles = (incoming) => {
    const imgs = Array.from(incoming).filter((f) =>
      f.type.startsWith("image/")
    );
    const withUrls = imgs.map((file) => {
      const url = URL.createObjectURL(file);
      urlRef.current.push(url);
      return { file, url };
    });
    onChange([...files, ...withUrls.map((x) => x.file)]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
    setDragOver(false);
  };

  const handleFileSelect = (e) => {
    addFiles(e.target.files);
  };

  const removeAt = (idx) => {
    const next = [...files];
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6">{title}</Typography>
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: 2,
          mb: 1,
          border: "2px dashed",
          borderColor: dragOver ? "primary.main" : "grey.400",
          textAlign: "center",
        }}
      >
        {"Перетащите фотографии, чтобы загрузить"}
        <input
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          id={`file-input-${title}`}
          onChange={handleFileSelect}
        />
        <p>ИЛИ</p>
        <label htmlFor={`file-input-${title}`}>
          <Button variant="text" component="span" sx={{ pt: 0 }}>
            Выбрать файлы
          </Button>
        </label>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {files.map((file, idx) => {
          const url = URL.createObjectURL(file);
          urlRef.current.push(url);
          return (
            <Box key={idx} sx={{ position: "relative" }}>
              <img
                src={url}
                alt={file.name}
                style={{ width: 80, height: 80, objectFit: "cover" }}
              />
              <IconButton
                size="small"
                onClick={() => removeAt(idx)}
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bgcolor: "rgba(255,255,255,0.7)",
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
