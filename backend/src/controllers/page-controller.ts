const React = require("react");
const http = require("http");
const ReactDOMServer = require("react-dom/server");
import { Home, Admin, Menu } from "../views";
import { IncomingMessage, ServerResponse } from "http";

export const renderPage = (req: IncomingMessage, res: ServerResponse) => {
  let PageComponent;

  switch (req.url) {
    case "/":
      PageComponent = Home;
      break;
    case "/admin":
      PageComponent = Admin;
      break;
    case "/menu":
      PageComponent = Menu;
      break;

    default:
      res.writeHead(404);
      res.end("Not Found");
      return;
  }
  const html = React.renderToString(React.createElement(PageComponent));
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
};
