import { IncomingMessage, ServerResponse } from "http";
import { MenuItemDAO } from "../models/DAO/menu-Item-DAO";

export const menuController = (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === "GET" && req.url === "/api/menu") {
    try {
      const items = MenuItemDAO.getAll();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(items));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to fetch menu items" }));
    }
  } else if (req.method === "GET" && req.url?.startsWith("/api/menu/")) {
    const id = parseInt(req.url.split("/").pop() || "");
    try {
      const item = MenuItemDAO.getById(id);
      if (!item) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Item not found" }));
        return;
      }
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Error fetching item" }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Menu route not found" }));
  }
};
