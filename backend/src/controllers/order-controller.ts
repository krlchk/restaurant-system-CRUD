import { IncomingMessage, ServerResponse } from "http";
import { OrderDAO } from "../models/DAO/order-DAO";
import {
  asyncAuthenticate,
  authenticate,
  AuthenticatedRequest,
  getUserFromRequest,
} from "../middleware/auth-middleware";
import url = require("url");
import logger from "../utils/logger";

export const orderController = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  const user = await asyncAuthenticate(req);
  if (!user) {
    logger.warn("User not authenticated. Redirecting to /login");
    res.writeHead(302, { Location: "/login" });
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/api/orders") {
    logger.info(`User ID ${user.id} fetching all orders.`);
    try {
      const orders = await OrderDAO.getAll();
      logger.info(`Fetched ${orders.length} orders successfully.`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(orders));
    } catch (err) {
      logger.error(`Failed to fetch orders: ${(err as Error).message}`);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to fetch orders" }));
    }
  } else if (req.method === "POST" && req.url === "/api/orders") {
    if (user.role !== "customer") {
      logger.warn(
        `User ID ${user.id} tried to place an order but is not a customer.`
      );
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Only customers can place orders" }));
      return;
    }
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { total_price } = JSON.parse(body);
        logger.info(
          `Creating order for user ID ${user.id} with total price ${total_price}.`
        );
        const order = await OrderDAO.createOrder(user.id, total_price);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(order));
      } catch (err) {
        logger.error(`Error while creating order: ${(err as Error).message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to create order" }));
      }
    });
  } else if (req.method === "PATCH" && req.url?.startsWith("/api/orders/")) {
    authenticate(req, res, async (authReq: AuthenticatedRequest) => {
      if (!authReq.user || authReq.user.role !== "admin") {
        logger.warn(`Unauthorized attempt to update order status.`);
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Forbidden: Admins only" }));
        return;
      }
      const parsedUrl = url.parse(req.url!, true);
      const idMatch = parsedUrl.pathname?.match(/^\/api\/orders\/(\d+)$/);
      if (!idMatch) {
        logger.warn(`Invalid order ID format in URL: ${req.url}`);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid order ID" }));
        return;
      }
      const orderId = parseInt(idMatch[1]);
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const { status } = JSON.parse(body);
          logger.info(`Updating order ID ${orderId} to status '${status}'.`);
          if (!["pending", "cooking", "completed"].includes(status)) {
            logger.warn(`Invalid status provided: ${status}`);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid status" }));
            return;
          }
          const updatedOrder = await OrderDAO.updateOrderStatus(
            orderId,
            status
          );
          if (!updatedOrder) {
            logger.warn(`Order ID ${orderId} not found.`);
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Order not found" }));
            return;
          }

          logger.info(
            `Order ID ${orderId} status updated successfully to '${status}'.`
          );
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(updatedOrder));
        } catch (err) {
          logger.error(
            `Failed to update order status: ${(err as Error).message}`
          );
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Failed to update order status" }));
        }
      });
    });
  } else {
    logger.warn(`Order route not found: ${req.method} ${req.url}`);
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Order route not found" }));
  }
};
