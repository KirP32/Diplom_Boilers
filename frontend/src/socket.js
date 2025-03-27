import { io } from "socket.io-client";

const URL = "http://localhost:8080";

export const socket = io(URL, {
  path: "/api/socket.io",
  transports: ["websocket"],
  autoConnect: false,
  //secure: true,
});
