import { Box, Typography } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

export default function OnWay() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding={4}
      borderRadius={4}
      bgcolor="#f5f5f5"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
      minHeight="200px"
    >
      <DirectionsCarIcon sx={{ fontSize: 48, color: "#1976d2" }} />
      <Typography variant="h6" mt={2}>
        Специалист в пути
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={1}>
        Ожидайте прибытия в ближайшее время.
      </Typography>
    </Box>
  );
}
