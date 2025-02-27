import { io } from "socket.io-client";

const URL = "https://ads-line.pro"; // Мне кажется нужно добавить на /api/socket.io"

export const socket = io(URL, {
  path: "/api/socket.io",
  transports: ["websocket"],
  autoConnect: false,
  //secure: true,
});
