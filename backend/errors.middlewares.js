import { ApiError } from "./ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;
  if (!(err instanceof ApiError)) {
    const statusCode =
      err.statusCode || 500;

    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], error.stack);
  }

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};

export { errorHandler };