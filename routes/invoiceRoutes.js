const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const { validateInvoice } = require("../validators/invoiceValidator");

router.post("/generate", validateInvoice, invoiceController.generateInvoice);

module.exports = router;
