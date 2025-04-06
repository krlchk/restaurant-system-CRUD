import { IncomingMessage, ServerResponse } from "http";
import { OrderDAO } from "../models/DAO/order-DAO";
import {
  asyncAuthenticate,
  authenticate,
  AuthenticatedRequest,
} from "../middleware/auth-middleware";
import url = require("url");

export const orderController = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  const user = asyncAuthenticate(req, res);
  if (!user) return;

  if (req.method === "GET" && req.url === "/api/orders") {
    try {
      const orders = await OrderDAO.getAll();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(orders));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to fetch orders" }));
    }
  } else if (req.method === "POST" && req.url === "/api/orders") {
    if (user.role !== "customer") {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Only customers can place orders" }));
      return;
    }
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { total_price } = JSON.parse(body);
        const order = await OrderDAO.createOrder(user.id, total_price);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(order));
      } catch (err) {
        console.error("Error while creating order:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to create order" }));
      }
    });
  } else if (req.method === "PATCH" && req.url?.startsWith("/api/orders/")) {
    authenticate(req, res, async (authReq: AuthenticatedRequest) => {
      if (!authReq.user || authReq.user.role !== "admin") {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Forbidden: Admins only" }));
        return;
      }
      const parsedUrl = url.parse(req.url!, true);
      const idMatch = parsedUrl.pathname?.match(/^\/api\/orders\/(\d+)$/);
      if (!idMatch) {
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
          if (!["pending", "cooking", "completed"].includes(status)) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid status" }));
            return;
          }
          const updatedOrder = await OrderDAO.updateOrderStatus(
            orderId,
            status
          );
          if (!updatedOrder) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Order not found" }));
            return;
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(updatedOrder));
        } catch (err) {
          console.error("err mes", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Failed to update order status" }));
        }
      });
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Order route not found" }));
  }
};
