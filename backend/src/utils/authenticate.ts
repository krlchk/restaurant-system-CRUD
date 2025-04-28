import { IncomingMessage, ServerResponse } from "http";
import cookie = require("cookie");
import jwt = require("jsonwebtoken");
import logger from "./logger";

const SECRET_KEY = "your_secret_key";

export async function asyncAuthenticate(
  req: IncomingMessage,
  res: ServerResponse
) {
  logger.info("Authenticating request (asyncAuthenticate)...");
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) {
    logger.warn("Authentication failed: No token found.");
    return null;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: number;
      email: string;
      role: string;
    };
    logger.info(`Authentication successful for user ID ${decoded.id}`);
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    logger.warn("Authentication failed: Invalid or expired token.");
    return null;
  }
}
