import { useState } from "react";
import PropTypes from "prop-types";
import { styled, keyframes } from "@mui/material/styles";
import { Box, TextField, Typography } from "@mui/material";
import Rating from "@mui/material/Rating";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";

const customIcons = {
  1: {
    icon: <SentimentVeryDissatisfiedIcon color="error" />,
    label: "Очень плохо",
  },
  2: {
    icon: <SentimentDissatisfiedIcon color="error" />,
    label: "Плохо",
  },
  3: {
    icon: <SentimentSatisfiedIcon color="warning" />,
    label: "Нормально",
  },
  4: {
    icon: <SentimentSatisfiedAltIcon color="success" />,
    label: "Хорошо",
  },
  5: {
    icon: <SentimentVerySatisfiedIcon color="success" />,
    label: "Отлично",
  },
};

function IconContainer(props) {
  const { value, ...other } = props;
  return <span {...other}>{customIcons[value].icon}</span>;
}
IconContainer.propTypes = {
  value: PropTypes.number.isRequired,
};

const slideSeq = keyframes`
  0%   { transform: translateX(-80px); opacity: 0; }
  50%  { transform: translateX(0);     opacity: 1; }
  100% { transform: translateX(80px);  opacity: 0; }
`;

// Компонент точечки
const Dot = styled("span")(({ theme, delay }) => ({
  display: "inline-block",
  width: 12,
  height: 12,
  margin: "0 6px",
  borderRadius: "50%",
  backgroundColor: theme.palette.text.primary,
  animation: `${slideSeq} 3.5s linear infinite`,
  animationDelay: delay,
}));

export default function WorkerRating({ requestID, access_level }) {
  const [value, setValue] = useState(0);
  const [comment, setComment] = useState("");
  if (access_level === 3) {
    return (
      <Box
        textAlign="center"
        sx={{
          mt: 2,
          gap: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Оцените выполнение работы
        </Typography>
        <Rating
          name={`worker-rating-${requestID}`}
          value={value}
          onChange={(_, newValue) => setValue(newValue)}
          IconContainerComponent={IconContainer}
          getLabelText={(val) => customIcons[val].label}
          highlightSelectedOnly
          sx={{
            "& .MuiSvgIcon-root": {
              fontSize: "3rem",
            },
            "& .MuiRating-iconEmpty .MuiSvgIcon-root": {
              color: (theme) => theme.palette.action.disabled,
            },
          }}
        />
        {value > 0 && (
          <>
            <TextField
              label="Комментарий (не обязательно)"
              multiline
              minRows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            />
          </>
        )}
      </Box>
    );
  } else {
    return (
      <Box textAlign="center" sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Ожидаем обратной связи от клиента
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Dot delay="0s" />
          <Dot delay="0s" />
          <Dot delay="0s" />
        </Box>
      </Box>
    );
  }
}
