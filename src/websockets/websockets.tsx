"use client";

import { io } from "socket.io-client";
import Endpoints from "../endpoint/endpoints";

const sockets = io(Endpoints.homeDir, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionAttempts: 10,
});

export default sockets;
