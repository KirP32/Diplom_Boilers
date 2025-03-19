/* eslint-disable react/prop-types */
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import MuiButton from "@mui/material/Button";
import InfoIcon from "@mui/icons-material/Info";

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ListView({
  availData,
  isProcessing,
  addRequest,
  setAdditionalOpen,
  setDetailsObject,
  setCurrentItem,
  removeRequest,
}) {
  const colWidth = "20%";

  const tableSx = {
    minWidth: 650,
    tableLayout: "fixed",
  };

  const headerCellSx = {
    fontWeight: "bold",
    width: colWidth,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return (
    <div>
      <h2
        style={{
          textAlign: "center",
          color: "var(--text-color)",
          marginTop: "20px",
        }}
      >
        Доступные заявки
      </h2>
      <TableContainer component={Paper} sx={{ marginTop: "15px" }}>
        <Table stickyHeader sx={tableSx} aria-label="available table">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Проблема</TableCell>
              <TableCell sx={headerCellSx} align="right">
                Датчик
              </TableCell>
              <TableCell sx={headerCellSx} align="right">
                Система
              </TableCell>
              <TableCell sx={headerCellSx} align="right">
                Создана
              </TableCell>
              <TableCell sx={headerCellSx} align="center">
                Действие
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availData?.allDevices?.map((item) => (
              <TableRow key={item.id}>
                <TableCell
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.problem_name}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.module}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.system_name}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDate(item.created_at)}
                </TableCell>
                <TableCell align="center" sx={{ position: "relative" }}>
                  <MuiButton
                    variant="contained"
                    onClick={() => addRequest(item.system_name, item.id)}
                    disabled={isProcessing}
                  >
                    Принять
                  </MuiButton>
                  <InfoIcon
                    onClick={() => {
                      setAdditionalOpen();
                      setCurrentItem(item);
                    }}
                    style={{
                      cursor: "pointer",
                      position: "absolute",
                      marginLeft: "10px",
                      marginTop: "5px",
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <h2
        style={{
          textAlign: "center",
          color: "var(--text-color)",
          marginTop: "15px",
        }}
      >
        Заявки в работе
      </h2>
      <TableContainer component={Paper} sx={{ marginTop: "15px" }}>
        <Table stickyHeader sx={tableSx} aria-label="worker table">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Проблема</TableCell>
              <TableCell sx={headerCellSx} align="right">
                Датчик
              </TableCell>
              <TableCell sx={headerCellSx} align="right">
                Система
              </TableCell>
              <TableCell sx={headerCellSx} align="right">
                Создана
              </TableCell>
              <TableCell sx={headerCellSx} align="center">
                Действие
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availData?.workerDevices?.map((item) => (
              <TableRow key={item.id}>
                <TableCell
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.problem_name}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.module}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.system_name}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDate(item.created_at)}
                </TableCell>
                <TableCell align="center" sx={{ position: "relative" }}>
                  <MuiButton
                    variant="contained"
                    onClick={() => {
                      setDetailsObject(item);
                    }}
                    disabled={isProcessing}
                  >
                    Подробнее
                  </MuiButton>
                  <span
                    className="material-icons"
                    style={{
                      color: "red",
                      cursor: "pointer",
                      position: "absolute",
                      marginLeft: "10px",
                      marginTop: "5px",
                    }}
                    onClick={() => removeRequest(item)}
                  >
                    cancel
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
