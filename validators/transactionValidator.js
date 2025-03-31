const { body, validationResult } = require("express-validator");
const createAppError = require("../utils/createAppError");

exports.validateTransactions = [
  body("header.title").notEmpty().withMessage("Nadpis je povinný."),
  body("table.columns")
    .isArray({ min: 1, max: 8 })
    .withMessage("Musí být 1 až 8 sloupců."),
  body("table.rows")
    .isArray({ min: 1 })
    .withMessage("Musí být alespoň jeden řádek."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((err) => err.msg)
        .join(" | ");
      return next(createAppError(`Validace selhala: ${message}`, 400));
    }
    next();
  },
];
