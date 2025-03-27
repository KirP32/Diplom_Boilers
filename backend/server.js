const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const router = require("./routes/index");
const pool = require("./dataBase/pool");
const { handleStage } = require("./controller/socket_io_controller");

const app = express();
const port = 8080;

const server = http.createServer(app);
const io = new Server(server, {
  path: "/api/socket.io",
  transports: ["websocket"],
  cors: {
    origin: [
      "https://ads-line.pro",
      "http://ads-line.pro",
      "http://localhost:5173",
      "http://185.46.10.111",
      "http://frontend:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  connectionStateRecovery: {},
});

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://185.46.10.111",
      "http://frontend:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

pool.connect((err) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err);
  } else {
    console.log("Connected to PostgreSQL");
  }
});

io.on("connection", (socket) => {
  socket.on("joinRequest", (requestId, callback) => {
    try {
      socket.join(requestId);
      callback({ status: "success" });
    } catch (error) {
      callback({ status: "error", message: error.message });
    }
  });

  socket.on("nextStage", async (data, callback) => {
    const result = await handleStage(
      data.id,
      data.access_level,
      data.max_stage,
      data.action
    );
    io.to(data.id).emit("requestUpdated", result);
    callback({
      ...result,
    });
  });

  socket.on("leaveRequest", (requestId) => {
    socket.leave(requestId);
  });

  socket.on("disconnect", () => {
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
  });
});

app.use("/", router);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
