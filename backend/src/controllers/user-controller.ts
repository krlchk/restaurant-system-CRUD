import { IncomingMessage, ServerResponse } from "http";
import { UserDAO } from "../models/DAO/user-DAO";
import jwt = require("jsonwebtoken");
import cookie = require("cookie");
import logger from "../utils/logger";
// v env
const SECRET_KEY = "your_secret_key";

export const userController = (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === "POST" && req.url === "/api/users") {
    logger.info("[POST] /api/users - Creating new user");
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        const { name, email, password } = JSON.parse(body);
        const newUser = await UserDAO.createUser(name, email, password);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(newUser));
        logger.info(`[POST] /api/users - User ${email} created successfully`);
      } catch (error) {
        logger.error(
          `[POST] /api/users - Error creating user: ${(error as Error).message}`
        );
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          })
        );
      }
    });
  } else if (req.method === "POST" && req.url === "/api/users/create-admin") {
    logger.info("[POST] /api/users/create-admin - Creating admin user");
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { name, email, password } = JSON.parse(body);
        const user = await UserDAO.createUser(name, email, password, "admin");
        res.writeHead(201, { "Content-Type": "application/json" });
        logger.info(
          `[POST] /api/users/create-admin - Admin ${email} created successfully`
        );
        res.end(JSON.stringify(user));
      } catch (err) {
        logger.error(
          `[POST] /api/users/create-admin - Error creating admin: ${
            (err as Error).message
          }`
        );
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to create admin" }));
      }
    });
  } else if (req.method === "POST" && req.url === "/api/users/login") {
    logger.info("[POST] /api/users/login - Attempting login");
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        const { email, password } = JSON.parse(body);
        const user = await UserDAO.verifyUser(email, password);
        if (!user) {
          logger.warn(
            `[POST] /api/users/login - Invalid login attempt for ${email}`
          );
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid email or password" }));
          return;
        }
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          SECRET_KEY,
          {
            expiresIn: "1h",
          }
        );

        res.setHeader(
          "Set-Cookie",
          cookie.serialize("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600,
            path: "/",
          })
        );
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Login successful", token, user }));
        logger.info(
          `[POST] /api/users/login - User ${email} logged in successfully`
        );
      } catch (error) {
        logger.error(
          `[POST] /api/users/login - Error during login: ${
            (error as Error).message
          }`
        );
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          })
        );
      }
    });
  } else if (req.method === "POST" && req.url === "/api/users/logout") {
    logger.info("[POST] /api/users/logout - Logging out user");
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600,
        path: "/",
      })
    );
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Logout successful" }));
  } else if (req.method === "GET" && req.url === "/api/users") {
    logger.info("[GET] /api/users - Fetching all users");
    UserDAO.getAllUsers()
      .then((users) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(users));
        logger.info(
          `[GET] /api/users - Successfully fetched ${users.length} users`
        );
      })
      .catch((error) => {
        logger.error(
          `[GET] /api/users - Error fetching users: ${error.message}`
        );
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      });
  } else if (req.method === "GET" && req.url?.startsWith("/api/users/")) {
    const id = Number(req.url.split("/").pop());
    if (isNaN(id)) {
      logger.warn(`[GET] /api/users/ - Invalid user ID`);
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Invalid user ID" }));
      return;
    }
    logger.info(`[GET] /api/users/${id} - Fetching user by ID`);
    UserDAO.getUserById(id)
      .then((user) => {
        if (user) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(user));
          logger.info(`[GET] /api/users/${id} - User found`);
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: "User not found" }));
          logger.warn(`[GET] /api/users/${id} - User not found`);
        }
      })
      .catch((error) => {
        logger.error(
          `[GET] /api/users/${id} - Error fetching user: ${error.message}`
        );
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      });
  } else if (req.method === "PUT" && req.url?.startsWith("/api/users/")) {
    let body = "";
    logger.info(`[PUT] ${req.url} - Updating user`);
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        const { name, email } = JSON.parse(body);
        const id = Number(req.url?.split("/").pop());

        if (isNaN(id)) {
          logger.warn(`[PUT] ${req.url} - Invalid user ID`);
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid user ID" }));
          return;
        }

        const updatedUser = await UserDAO.updateUser(id, name, email);

        if (updatedUser) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(updatedUser));
          logger.info(`[PUT] ${req.url} - User updated successfully`);
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: "User not found" }));
          logger.warn(`[PUT] ${req.url} - User not found`);
        }
      } catch (error) {
        logger.error(
          `[PUT] ${req.url} - Error updating user: ${(error as Error).message}`
        );
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          })
        );
      }
    });
  } else if (req.method === "DELETE" && req.url?.startsWith("/api/users/")) {
    const id = Number(req.url?.split("/").pop());
    if (isNaN(id)) {
      logger.warn(`[DELETE] ${req.url} - Invalid user ID`);
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Invalid user ID" }));
      return;
    }
    logger.info(`[DELETE] /api/users/${id} - Deleting user`);
    UserDAO.deleteUser(id)
      .then((deletedUser) => {
        if (deletedUser) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(deletedUser));
          logger.info(`[DELETE] /api/users/${id} - User deleted successfully`);
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: "User not found" }));
          logger.warn(`[DELETE] /api/users/${id} - User not found`);
        }
      })
      .catch((error) => {
        logger.error(
          `[DELETE] /api/users/${id} - Error deleting user: ${error.message}`
        );
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      });
  } else {
    logger.warn(`[${req.method}] ${req.url} - API route not found`);
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "API route not found" }));
  }
};
