import { IncomingMessage, ServerResponse } from "http";
import { UserDAO } from "../models/DAO/user-DAO";
import jwt = require("jsonwebtoken");
import cookie = require("cookie");
const SECRET_KEY = "super_secret_key";

export const userController = (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === "POST" && req.url === "/api/users") {
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
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          })
        );
      }
    });
  } else if (req.method === "POST" && req.url === "/api/users/login") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        const { email, password } = JSON.parse(body);
        const user = await UserDAO.verifyUser(email, password);
        if (!user) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid email or password" }));
          return;
        }
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
          expiresIn: "1h",
        });

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
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          })
        );
      }
    });
  } else if (req.method === "POST" && req.url === "/api/users/logout") {
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
    UserDAO.getAllUsers()
      .then((users) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(users));
      })
      .catch((error) => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      });
  } else if (req.method === "GET" && req.url?.startsWith("/api/users/")) {
    const id = Number(req.url.split("/").pop());
    if (isNaN(id)) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Invalid user ID" }));
      return;
    }
    UserDAO.getUserById(id)
      .then((user) => {
        if (user) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(user));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: "User not found" }));
        }
      })
      .catch((error) => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      });
  } else if (req.method === "PUT" && req.url?.startsWith("/api/users/")) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        const { name, email } = JSON.parse(body);
        const id = Number(req.url?.split("/").pop());

        if (isNaN(id)) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid user ID" }));
          return;
        }

        const updatedUser = await UserDAO.updateUser(id, name, email);

        if (updatedUser) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(updatedUser));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: "User not found" }));
        }
      } catch (error) {
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
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Invalid user ID" }));
      return;
    }
    UserDAO.deleteUser(id)
      .then((deletedUser) => {
        if (deletedUser) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(deletedUser));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: "User not found" }));
        }
      })
      .catch((error) => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "API route not found" }));
  }
};
