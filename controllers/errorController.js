const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status || "error",
      message: err.message,
    });
  } else {
    console.error("\u{1F4A5} ERROR:", err);
    res.status(500).json({
      status: "error",
      message: "Nastala neočekávaná chyba na serveru.",
    });
  }
};

const handleErrors = (err, req, res, next) => {
  sendErrorProd(err, req, res);
};

module.exports = { handleErrors };
