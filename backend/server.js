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
  console.log("Клиент подключен:", socket.id);

  socket.on("message", (data) => {
    console.log("Сообщение от клиента:", data);
    io.emit("message", `Сервер получил: ${data}`);
  });

  socket.on("disconnect", () => {
    console.log("Клиент отключен:", socket.id);
  });
});

app.use("/", router);

// Вместо app.listen используем server.listen
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
