const express = require("express");
const bodyParser = require("body-parser");
const invoiceRoutes = require("./routes/invoiceRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const { handleErrors } = require("./controllers/errorController");
const createAppError = require("./utils/createAppError");

const app = express();

app.use(bodyParser.json());

// Invalid JSON error
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return next(createAppError("Neplatný JSON formát.", 400));
  }
  next(err);
});

app.use("/invoices", invoiceRoutes);
app.use("/transactions", transactionRoutes);

app.all("*", (req, res, next) => {
  next(
    createAppError(
      `Nemohu najít ${req.method} ${req.originalUrl} na tomto serveru!`,
      404
    )
  );
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

app.use(handleErrors);

module.exports = app;
