import http = require("http");
import { initDB } from "./init-db";
import { router } from "./routes/routes";
import dotenv = require("dotenv");
import { MenuItemDAO } from "./models/DAO/menu-Item-DAO";
import logger from "./utils/logger";

dotenv.config();

const port = process.env.PORT || 5000;

const server = http.createServer(router);

server.listen(port, async () => {
  logger.info(`Server is running on port:${port}`);
  //MenuItemDAO.seed().then(() => console.log("Menu seeded"));
  await initDB();
});
