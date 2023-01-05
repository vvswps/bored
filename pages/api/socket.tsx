import { Server } from "socket.io";

export default function SocketHandler(req: any, res: any) {
  console.log("this is socket handler");

  // We need to set up socket server only once per server
  // It means that socket server was already initialized
  if (res.socket.server.io) {
    console.log("Already set up");
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("New connection");

    socket.on("draw", (payload: any) => {
      socket.broadcast.emit("boardUpdate", payload);
    });
  });

  console.log("Setting up socket");
  res.end();
}
