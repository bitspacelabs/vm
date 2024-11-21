import Koa from "koa";
import Router from "koa-router";
import bodyParser  from "koa-bodyparser";
import cors from "koa2-cors";
import { handleRouters } from "./routers";
import http from 'http'
// const http = require("http");

const app = new Koa();
const router = new Router();

app.use(bodyParser())
handleRouters(router)

app.use(
  cors({
    origin: function () {
      return "*";
    },
    maxAge: 5,
    credentials: true,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
    exposeHeaders: ["WWW-Authenticate", "Server-Authorization"],
  })
);
app.use(router.routes());
app.use(router.allowedMethods());

// start the server
http.createServer(app.callback()).listen(3333);
