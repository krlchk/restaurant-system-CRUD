const http = require("http");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
import { IncomingMessage, ServerResponse } from "http";
import { renderPage } from "./controllers/page-controller";
import { initDB } from "./init-db";
import { router } from "./routes/routes";

const PORT: number = 5000;

const server = http.createServer(router);

server.listen(PORT, async () => {
  console.log(`Server is running on port:${PORT}`);
  await initDB();
});
