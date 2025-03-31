import { IncomingMessage, ServerResponse } from "http";
import { userController } from "../controllers/user-controller";
import { renderPage } from "../controllers/page-controller";

export const router = (req: IncomingMessage, res: ServerResponse) => {
  if (req.url?.startsWith("/api")) {
    if (req.url.startsWith("/api/users")) {
      userController(req, res);
      return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "API route not found" }));
    return;
  }
  renderPage(req, res);
};
