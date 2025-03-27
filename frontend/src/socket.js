import { io } from "socket.io-client";

const URL = "https://ads-line.pro";
// http://localhost:8080
export const socket = io(URL, {
  path: "/api/socket.io",
  transports: ["websocket"],
  autoConnect: false,
  secure: true,
});
