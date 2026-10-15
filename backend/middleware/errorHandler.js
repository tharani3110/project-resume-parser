// 404 for anything that matched no route.
export function notFound(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}

// One place that turns an error into a response. Multer's own errors arrive
// here too, because `upload.single()` calls next(err) when it rejects.
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Multer signals an oversized upload with this code, not with `status`.
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "PDF is larger than 5 MB." });
  }

  const status = err.status || 500;
  if (status >= 500) console.error("[error]", err);

  res.status(status).json({
    error: status >= 500 ? "Something went wrong on the server." : err.message,
  });
}
