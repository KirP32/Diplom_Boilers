/* eslint-disable react/prop-types */
import { Box, Typography, Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import $api from "../../../../../../../../http";

export default function SignatureUploader({ requestID, sseEvent }) {
  const [photoURL, setPhotoURL] = useState({ workerURL: null, userURL: null });
  useEffect(() => {
    $api
      .get(`/getRequestPhoto/${requestID}?category=signature`)
      .then((result) =>
        setPhotoURL({
          workerURL: result.data.worker_signature.url,
          userURL: result.data.user_signature.url,
        })
      )
      .catch((error) => console.log(error));
  }, [requestID]);

  useEffect(() => {
    if (!sseEvent) return;
    if (sseEvent.type === "signature_updated") {
      $api
        .get(`/getRequestPhoto/${requestID}?category=signature`)
        .then((result) => {
          setPhotoURL({
            workerURL: result.data.worker_signature.url,
            userURL: result.data.user_signature.url,
          });
        });
    }
  }, [requestID, sseEvent]);

  return (
    <Box sx={{ mt: 2 }}>
      <SignatureCanvasComponent
        name="Работника"
        category="signature/worker"
        requestID={requestID}
        url={photoURL.workerURL}
      />
      <SignatureCanvasComponent
        name="Потребителя"
        category="signature/user"
        requestID={requestID}
        url={photoURL.userURL}
      />
    </Box>
  );
}

function SignatureCanvasComponent({ name, category, requestID, url }) {
  const sigCanvas = useRef(null);
  const [localUrl, setLocalUrl] = useState(url);

  useEffect(() => {
    setLocalUrl(url);
  }, [url]);

  const handleClearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
    setLocalUrl(null);
  };

  const handleSendSignature = async () => {
    const blob = await new Promise((resolve) =>
      sigCanvas.current.getTrimmedCanvas().toBlob(resolve, "image/png")
    );
    const file = new File(
      [blob],
      `signature_${name === "Работника" ? "worker" : "user"}_${requestID}.png`,
      { type: "image/png" }
    );

    const formData = new FormData();
    formData.append("category", category);
    formData.append("files", file);

    try {
      const response = await $api.post(`/uploadPhoto/${requestID}`, formData);
      const newUrl = response.data?.photos?.[0]?.url;
      if (newUrl) {
        setLocalUrl(newUrl);
      }
    } catch (error) {
      console.error("Ошибка при загрузке подписи:", error);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Подпись {name}:
      </Typography>
      <Box
        sx={{
          border: "2px solid black",
          width: 505,
          height: 205,
        }}
      >
        {localUrl ? (
          <img src={localUrl} alt="" style={{ width: 500, height: 200 }} />
        ) : (
          <SignatureCanvas
            penColor="black"
            canvasProps={{
              width: 500,
              height: 200,
              className: "sigCanvas",
            }}
            ref={sigCanvas}
          />
        )}
      </Box>
      <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
        <Button variant="outlined" color="error" onClick={handleClearSignature}>
          Очистить
        </Button>
        <Button
          variant="contained"
          onClick={handleSendSignature}
          disabled={!!localUrl}
        >
          Сохранить
        </Button>
      </Box>
    </Box>
  );
}
