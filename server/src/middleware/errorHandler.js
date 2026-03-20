const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message);
  const status = err.status || 500;
  const message = status >= 500 ? 'Internal Server Error' : (err.message || 'Internal Server Error');
  res.status(status).json({ error: message });
};

export default errorHandler;
