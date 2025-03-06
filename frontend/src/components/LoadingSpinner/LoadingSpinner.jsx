import { CircularProgress } from "@mui/material";

export const LoadingSpinner = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "hsl(0, 0.00%, 0.00%)",
      zIndex: 9999,
    }}
  >
    <CircularProgress size={80} />
  </div>
);
