import { IncomingMessage, ServerResponse } from "http";
import { UserDAO } from "../models/DAO/user-DAO";

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
        let errorMessage = "Failed to do something exceptional";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: errorMessage }));
      }
    });
  } else {
    res.writeHead(405);
    res.end("Method is not allowed");
  }
};
