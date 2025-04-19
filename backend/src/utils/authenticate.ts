import { IncomingMessage, ServerResponse } from "http";
import cookie = require("cookie");
import jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key";

export async function asyncAuthenticate(
  req: IncomingMessage,
  res: ServerResponse
) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: number;
      email: string;
      role: string;
    };

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
}
