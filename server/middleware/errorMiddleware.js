export const errorHandler = (err, req, res, next) => {
  console.error('💥 Centralized Error Triggered:', err.stack || err.message || err);

  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
