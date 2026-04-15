export function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message)
  const status = err.statusCode || 500
  res.status(status).json({
    message: status === 500 ? '服务器内部错误' : err.message
  })
}
