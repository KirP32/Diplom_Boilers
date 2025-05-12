import { io } from "socket.io-client";

const URL = "http://localhost:8080";
// http://localhost:8080 https://ads-line.pro
export const socket = io(URL, {
  path: "/api/socket.io",
  transports: ["polling", "websocket"],
  autoConnect: false,
  secure: true,
});
