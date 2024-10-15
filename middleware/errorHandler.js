function errorHandler(err, req, res, next) {
  console.error(err.stack);
  return res.sendStatus(500);
}

export default errorHandler;
