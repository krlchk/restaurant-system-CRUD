import { IncomingMessage, ServerResponse } from "http";
import { userController } from "../controllers/user-controller";
import { menuController } from "../controllers/menu-controller";
import { orderController } from "../controllers/order-controller";
import { handlePageRoute } from "../controllers/page-controller";

export const router = (req: IncomingMessage, res: ServerResponse) => {
  if (req.url?.startsWith("/api")) {
    if (req.url.startsWith("/api/users")) {
      userController(req, res);
      return;
    }
    if (req.url.startsWith("/api/menu")) {
      menuController(req, res);
      return;
    }
    if (req.url.startsWith("/api/orders")) {
      orderController(req, res);
      return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "API route not found" }));
    return;
  }

  handlePageRoute(req, res);
};
