import { IncomingMessage, ServerResponse } from "http";
import jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key";

export interface AuthenticatedRequest extends IncomingMessage {
  user?: { id: number; email: string; role: string };
}

export const authenticate = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (req: AuthenticatedRequest) => void
) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "No token provided" }));
    return;
  }

  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Token not found in cookies" }));
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: number;
      email: string;
      role: string;
    };
    (req as AuthenticatedRequest).user = decoded;
    next(req as AuthenticatedRequest);
  } catch (err) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid or expired token" }));
  }
};

export const asyncAuthenticate = (
  req: IncomingMessage,
  res: ServerResponse
): { id: number; email: string } | null => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "No token provided" }));
    return null;
  }

  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Token not found in cookies" }));
    return null;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: number;
      email: string;
    };
    return decoded;
  } catch (err) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid or expired token" }));
    return null;
  }
};
