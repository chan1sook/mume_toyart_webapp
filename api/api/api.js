import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";

import { log } from "../utils/logging.js";
import session from "./session.js";
import { getRedisClient } from "../services/redis.js";
import indexRouter from "./routers/index.js";
import userRouter from "./routers/user.js";
import artItemRouter from "./routers/artitem.js";
import uploadRouter from "./routers/upload.js";
import APIError from "../utils/apierror.js";
import { error } from "console";

export function startApiService(port = 4000) {
  const redisClient = getRedisClient();
  const app = express();
  const httpServer = createServer(app);
  const sessionMiddleware = session(redisClient);

  app.use(sessionMiddleware);
  app.use(
    cors({
      credentials: true,
      origin: function (origin, callback) {
        callback(null, true);
      },
    })
  );
  app.use(helmet({}));

  app.use(
    "/upload/img",
    express.static(process.env.IMG_UPLOAD_PATH || "upload/img")
  );
  app.use(
    "/upload/cert",
    express.static(process.env.CERT_UPLOAD_PATH || "upload/cert")
  );

  app.use(indexRouter);
  app.use(userRouter);
  app.use(uploadRouter);
  app.use(artItemRouter);

  app.use((err, req, res, next) => {
    let code = 500;
    let errorId;

    if (err instanceof APIError) {
      code = err.code;
      errorId = err.errorId;
    }

    error(err.message, { name: "API", tags: [`${code}`] });
    res.status(code).json({
      status: "Error",
      code,
      errorId,
      message: err.message,
    });
  });

  httpServer.listen(port, () => {
    log([`Start at port `, `${port}`.green], { name: "API" });
  });

  return { app };
}
