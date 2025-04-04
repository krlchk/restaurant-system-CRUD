import http = require("http");
import { initDB } from "./init-db";
import { router } from "./routes/routes";
import dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT || 5000;

const server = http.createServer(router);

server.listen(port, async () => {
  console.log(`Server is running on port:${port}`);
  await initDB();
});
