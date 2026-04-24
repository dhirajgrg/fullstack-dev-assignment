import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import AppError from "./utils/appError.utils.js";
import globalErrorHandler from "./controllers/error.controller.js";
import secretRoutes from "./routes/secret.route.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173", 
    methods: ["GET", "POST"],
    credentials: true,
  }),
);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      status: "fail",
      message: "Too many requests from this IP, please try again later",
    },
  }),
);

app.use("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "backend route is healthy !!!",
  });
});

app.use("/api/v1/secrets", secretRoutes);

app.use(/.*/, (req, res, next) => {
  next(new AppError(" This route is not defined on the server", 404));
});
app.use(globalErrorHandler);

export default app;
