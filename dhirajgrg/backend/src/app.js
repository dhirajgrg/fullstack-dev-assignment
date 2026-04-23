import express from "express";
import cors from "cors";
import morgan from "morgan";

import AppError from "./utils/appError.utils.js";
import globalErrorHandler from "./controllers/error.controller.js";
import secretRoutes from './routes/secret.route.js'

const app = express();

app.use(cors());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());

app.use("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "backend route is healthy !!!",
  });
});

app.use('/api/v1/secret', secretRoutes)

app.use(/.*/, (req, res, next) => {
  next(new AppError(" This route is not defined on the server", 404));
});
app.use(globalErrorHandler);

export default app;
