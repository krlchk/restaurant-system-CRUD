import { IncomingMessage, ServerResponse } from "http";
import { MenuItemDAO } from "../models/DAO/menu-Item-DAO";
import logger from "../utils/logger";

export const menuController = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  if (req.method === "GET" && req.url === "/api/menu") {
    logger.info(`[GET] /api/menu - Fetching all menu items`);
    try {
      const items = MenuItemDAO.getAll();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(items));
      logger.info(
        `[GET] /api/menu - Successfully fetched ${(await items).length} items`
      );
    } catch (err) {
      logger.error(
        `[GET] /api/menu - Failed to fetch menu items: ${
          (err as Error).message
        }`
      );
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to fetch menu items" }));
    }
  } else if (req.method === "GET" && req.url?.startsWith("/api/menu/")) {
    const id = parseInt(req.url.split("/").pop() || "");
    logger.info(`[GET] /api/menu/${id} - Fetching item by id`);
    try {
      const item = MenuItemDAO.getById(id);
      if (!item) {
        logger.warn(`[GET] /api/menu/${id} - Item not found`);
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Item not found" }));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(item));
      logger.info(`[GET] /api/menu/${id} - Successfully fetched item`);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Error fetching item" }));
      logger.info(`[GET] /api/menu/${id} - Successfully fetched item`);
    }
  } else {
    logger.warn(`[${req.method}] ${req.url} - Route not found`);
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Menu route not found" }));
  }
};
