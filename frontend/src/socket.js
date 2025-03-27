import { io } from "socket.io-client";

const URL = "http://localhost:8080"; // Мне кажется нужно добавить на /api/socket.io"

export const socket = io(URL, {
  path: "/api/socket.io",
  transports: ["websocket"],
  autoConnect: false,
  //secure: true,
});
