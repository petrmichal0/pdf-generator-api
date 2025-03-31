const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { validateTransactions } = require("../validators/transactionValidator");

router.post(
  "/generate",
  validateTransactions,
  transactionController.generateTransactions
);

module.exports = router;
