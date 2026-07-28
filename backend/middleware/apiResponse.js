const apiResponse = (req, res, next) => {
  res.success = (data = null, message = "Success", status = 200) =>
    res.status(status).json({
      status,
      message,
      error: null,
      data,
    });

  res.failure = (error, message = "Request failed", status = 500) =>
    res.status(status).json({
      status,
      message,
      error: error instanceof Error ? error.message : error,
      data: null,
    });

  next();
};

module.exports = apiResponse;