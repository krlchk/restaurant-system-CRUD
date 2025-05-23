import path = require("path");
import ejs = require("ejs");
import { ServerResponse } from "http";
import fs = require("fs");
import logger from "./logger";

export const renderEJS = (
  res: ServerResponse,
  view: string,
  data: Record<string, any> = {}
) => {
  const viewPath = path.join(__dirname, "..", "views-ejs", `${view}.ejs`);
  const layoutPath = path.join(__dirname, "..", "views-ejs", "layout.ejs");

  fs.readFile(viewPath, "utf8", (err, content) => {
    if (err) {
      logger.error(`Error reading view file: ${view}.ejs`);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error rendering page");
      return;
    }

    const body = ejs.render(content, data);

    fs.readFile(layoutPath, "utf8", (layoutErr, layoutContent) => {
      if (layoutErr) {
        logger.error("Error reading layout.ejs");
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error rendering layout");
        return;
      }

      const fullHtml = ejs.render(layoutContent, { ...data, body });

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(fullHtml);
      logger.info(`Successfully rendered view: ${view}.ejs`);
    });
  });
};
