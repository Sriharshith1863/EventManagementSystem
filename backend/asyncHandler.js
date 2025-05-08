
// to handle the asynchronous nature of the connections which we are going to connect i.e. db, any other api etc.....
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };