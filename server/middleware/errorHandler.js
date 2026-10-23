export const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.stack || err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
