const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const router = require("./routes/index");
const pool = require("./dataBase/pool");

const app = express();
const port = 8080;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://185.46.10.111",
      "http://frontend:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
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

      const requestData = { message: "Всё работает" };

      socket.emit("requestData", requestData);
      socket.to(requestId).emit("userJoined", {
        userId: socket.id,
        message: "Новый участник присоединился",
      });

      callback({ status: "success" });
    } catch (error) {
      callback({ status: "error", message: error.message });
    }
  });

  socket.on("updateRequest", (requestId, updateData) => {
    io.to(requestId).emit("requestUpdated", updateData);
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
