const sendDeverr = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err: err,
    stack: err.stack,
  });
};

const sendProderr = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error("ERROR 💥", err);

  return res.status(500).json({
    status: "fail",
    message: "Something went wrong!",
  });
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "fail";

  if (process.env.NODE_ENV === "development") {
    return sendDeverr(err, res);
  }

  if (process.env.NODE_ENV === "production") {
    return sendProderr(err, res);
  }
};

export default globalErrorHandler;
