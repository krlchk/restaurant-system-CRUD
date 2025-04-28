import { IncomingMessage, ServerResponse } from "http";
import { userController } from "../controllers/user-controller";
import { menuController } from "../controllers/menu-controller";
import { orderController } from "../controllers/order-controller";
import { handlePageRoute } from "../controllers/page-controller";
import logger from "../utils/logger";

export const router = (req: IncomingMessage, res: ServerResponse) => {
  logger.info(`Routing request: ${req.method} ${req.url}`);

  if (req.url?.startsWith("/api")) {
    if (req.url.startsWith("/api/users")) {
      logger.info("Routing to userController");
      userController(req, res);
      return;
    }
    if (req.url.startsWith("/api/menu")) {
      logger.info("Routing to menuController");
      menuController(req, res);
      return;
    }
    if (req.url.startsWith("/api/orders")) {
      logger.info("Routing to orderController");
      orderController(req, res);
      return;
    }
    logger.warn(`API route not found: ${req.url}`);
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "API route not found" }));
    return;
  }

  logger.info("Routing to handlePageRoute");
  handlePageRoute(req, res);
};
