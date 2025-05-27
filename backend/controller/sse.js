const clients = [];

function registerSSE(req, res) {
  const requestID = parseInt(req.query.requestID);
  if (!requestID) return res.sendStatus(400);

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  const heartbeat = setInterval(() => {
    res.write("event: ping\ndata: {}\n\n");
  }, 25000);

  const client = { requestID, res };
  clients.push(client);

  req.on("close", () => {
    clearInterval(heartbeat);
    clients.splice(clients.indexOf(client), 1);
  });
}

function sendToUser(requestID, event, data) {
  const payload = `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
  clients
    .filter((c) => Number(c.requestID) === Number(requestID))
    .forEach((c) => {
      if (!c.res.writableEnded) {
        c.res.write(payload);
      } else {
      }
    });
}

module.exports = {
  registerSSE,
  sendToUser,
};
