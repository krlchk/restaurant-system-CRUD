import { IncomingMessage, ServerResponse } from "http";
import jwt = require("jsonwebtoken");
import logger from "../utils/logger";

const SECRET_KEY = "your_secret_key";

export interface AuthenticatedRequest extends IncomingMessage {
  user?: { id: number; email: string; role: string };
}

export const authenticate = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (req: AuthenticatedRequest) => void
) => {
  logger.info(`Authenticating request...`);
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    logger.warn(`Authentication failed: No cookie header.`);
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
    logger.warn(`Authentication failed: Token not found in cookies.`);
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
    logger.info(`Authentication successful for user ID ${decoded.id}`);
    next(req as AuthenticatedRequest);
  } catch (err) {
    logger.warn(`Authentication failed: Invalid or expired token.`);
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid or expired token" }));
  }
};

export const asyncAuthenticate = (
  req: IncomingMessage
): { id: number; email: string; role: string } | null => {
  logger.info(`Async authenticating request...`);
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    logger.warn(`Async authentication failed: No cookie header.`);
    return null;
  }

  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    logger.warn(`Async authentication failed: Token not found in cookies.`);
    return null;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: number;
      email: string;
      role: string;
    };
    logger.info(`Async authentication successful for user ID ${decoded.id}`);
    return decoded;
  } catch (err) {
    logger.warn(`Async authentication failed: Invalid or expired token.`);
    return null;
  }
};

export const getUserFromRequest = (
  req: IncomingMessage
): { id: number; email: string; role: string } | null => {
  logger.info(`Getting user from request...`);
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    logger.warn(`Get user failed: No cookie header.`);
    return null;
  }

  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    logger.warn(`Get user failed: Token not found in cookies.`);
    return null;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: number;
      email: string;
      role: string;
    };
    logger.info(`User retrieved successfully: ID ${decoded.id}`);
    return decoded;
  } catch (err) {
    logger.warn(`Get user failed: Invalid or expired token.`);
    return null;
  }
};
