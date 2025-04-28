import { IncomingMessage, ServerResponse } from "http";
import { renderEJS } from "../utils/render-EJS";
import {
  asyncAuthenticate,
  getUserFromRequest,
} from "../middleware/auth-middleware";
import { MenuItemDAO } from "../models/DAO/menu-Item-DAO";
import { OrderDAO } from "../models/DAO/order-DAO";
import logger from "../utils/logger";

export const handlePageRoute = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  logger.info(`Incoming page request: ${req.method} ${req.url}`);
  if (req.method === "GET") {
    switch (req.url) {
      case "/": {
        const user = getUserFromRequest(req);
        let orders = [];
        if (user) {
          logger.info(`Fetching orders for user ID ${user.id}`);
          orders = await OrderDAO.getByUserId(user.id);
        } else {
          logger.info(`No user session found for home page.`);
        }
        logger.info(`Rendering home page.`);
        return renderEJS(res, "home", { title: "Home", user, orders });
      }

      case "/admin": {
        const user = await asyncAuthenticate(req);
        if (!user || user.role !== "admin") {
          logger.warn(`Unauthorized access attempt to /admin page.`);
          res.writeHead(302, { Location: "/login" });
          res.end();
          return;
        }
        logger.info(`Rendering admin page for user ID ${user.id}`);
        return renderEJS(res, "admin", { title: "Admin", user });
      }

      case "/menu": {
        const user = await asyncAuthenticate(req);
        if (!user) {
          logger.warn(`Unauthorized access attempt to /menu page.`);
          res.writeHead(302, { Location: "/login" });
          res.end();
          return;
        }
        logger.info(`Fetching menu items for user ID ${user.id}`);
        const menuItems = await MenuItemDAO.getAll();
        logger.info(`Fetched ${menuItems.length} menu items.`);
        return renderEJS(res, "menu", { title: "Menu", menuItems, user });
      }

      case "/login": {
        const user = await asyncAuthenticate(req);
        logger.info(`Rendering login page.`);
        return renderEJS(res, "login", { title: "Login", user });
      }

      case "/register": {
        const user = await asyncAuthenticate(req);
        logger.info(`Rendering register page.`);
        return renderEJS(res, "register", { title: "Register", user });
      }

      case "/logout": {
        logger.info(`User logging out.`);
        res.setHeader("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0");
        res.writeHead(302, { Location: "/login" });
        res.end();
        return;
      }

      case req.url?.match(/^\/order\/\d+$/)?.input: {
        if (!req.url) break;

        const user = await asyncAuthenticate(req);
        if (!user) {
          logger.warn(`Unauthorized access attempt to order details page.`);
          res.writeHead(302, { Location: "/login" });
          res.end();
          return;
        }

        const orderId = parseInt(req.url.split("/")[2]);
        logger.info(`Fetching order details for order ID ${orderId}.`);
        const order = await OrderDAO.getById(orderId);

        if (!order) {
          logger.warn(`Order ID ${orderId} not found.`);
          res.writeHead(404);
          res.end("Order not found");
          return;
        }
        logger.info(`Rendering order details page for order ID ${orderId}.`);
        return renderEJS(res, "order-details", {
          title: `Order #${orderId}`,
          user,
          order,
        });
      }

      default:
        logger.warn(`Page route not found: ${req.url}`);
        res.writeHead(404);
        res.end("Not Found");
    }
  } else {
    logger.warn(`Unsupported HTTP method: ${req.method} for ${req.url}`);
  }
};
