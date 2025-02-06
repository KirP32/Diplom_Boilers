import { io } from "socket.io-client";

const URL = "wss://ads-line.pro/api";

export const socket = io(URL, {
  transports: ["websocket"],
  autoConnect: false,
});
