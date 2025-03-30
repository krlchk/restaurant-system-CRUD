const http = require("http");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
import { IncomingMessage, ServerResponse } from "http";
import { renderPage } from "./controllers/page-controller";
import { initDB } from "./init-db";

const PORT: number = 5000;

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    renderPage(req, res);
  }
);

server.listen(PORT, async () => {
  console.log(`Server is running on port:${PORT}`);
  await initDB();
});
