import { io } from "socket.io-client";

const URL = "https://ads-line.pro";

export const socket = io(URL, {
  path: "/api/socket.io",
  transports: ["websocket", "polling"],
  autoConnect: false,
  secure: true,
});
