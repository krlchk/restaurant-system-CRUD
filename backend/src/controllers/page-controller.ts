import { IncomingMessage, ServerResponse } from "http";
import { renderEJS } from "../utils/render-EJS";
import {
  asyncAuthenticate,
  getUserFromRequest,
} from "../middleware/auth-middleware";
import { MenuItemDAO } from "../models/DAO/menu-Item-DAO";
import { OrderDAO } from "../models/DAO/order-DAO";

export const handlePageRoute = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  if (req.method === "GET") {
    switch (req.url) {
      case "/": {
        const user = getUserFromRequest(req);
        let orders = [];
        if (user) {
          orders = await OrderDAO.getByUserId(user.id);
        }
        return renderEJS(res, "home", { title: "Home", user, orders });
      }

      case "/admin": {
        const user = await asyncAuthenticate(req);
        if (!user || user.role !== "admin") {
          res.writeHead(302, { Location: "/login" });
          res.end();
          return;
        }
        return renderEJS(res, "admin", { title: "Admin", user });
      }

      case "/menu": {
        const user = await asyncAuthenticate(req);
        if (!user) {
          res.writeHead(302, { Location: "/login" });
          res.end();
          return;
        }

        const menuItems = await MenuItemDAO.getAll();
        return renderEJS(res, "menu", { title: "Menu", menuItems, user });
      }

      case "/login": {
        const user = await asyncAuthenticate(req);
        return renderEJS(res, "login", { title: "Login", user });
      }

      case "/register": {
        const user = await asyncAuthenticate(req);
        return renderEJS(res, "register", { title: "Register", user });
      }

      case "/logout": {
        res.setHeader("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0");
        res.writeHead(302, { Location: "/login" });
        res.end();
        return;
      }

      case req.url?.match(/^\/order\/\d+$/)?.input: {
        if (!req.url) break;

        const user = await asyncAuthenticate(req);
        if (!user) {
          res.writeHead(302, { Location: "/login" });
          res.end();
          return;
        }

        const orderId = parseInt(req.url.split("/")[2]);
        const order = await OrderDAO.getById(orderId);

        if (!order) {
          res.writeHead(404);
          res.end("Order not found");
          return;
        }

        return renderEJS(res, "order-details", {
          title: `Order #${orderId}`,
          user,
          order,
        });
      }

      default:
        res.writeHead(404);
        res.end("Not Found");
    }
  }
};