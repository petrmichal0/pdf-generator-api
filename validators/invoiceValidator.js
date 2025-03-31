const { body, validationResult } = require("express-validator");
const createAppError = require("../utils/createAppError");

exports.validateInvoice = [
  body("header.supplier").notEmpty().withMessage("Dodavatel je povinný."),
  body("header.date").notEmpty().withMessage("Datum je povinné."),
  body("header.due_date")
    .notEmpty()
    .withMessage("Splatnost faktury je povinná."),
  body("header.order_number")
    .notEmpty()
    .withMessage("Číslo objednávky je povinné."),
  body("header.payment_method")
    .notEmpty()
    .withMessage("Způsob platby je povinný.")
    .isIn(["hotově", "kartou", "převodem"])
    .withMessage("Neplatný způsob platby."),
  body("header.iban").custom((value, { req }) => {
    if (req.body.header.payment_method === "převodem" && !value) {
      throw new Error("IBAN je povinný při platbě převodem.");
    }
    return true;
  }),
  body("table.columns")
    .isArray({ min: 1, max: 8 })
    .withMessage("Musí být 1 až 8 sloupců."),
  body("table.rows")
    .isArray({ min: 1 })
    .withMessage("Musí být alespoň jeden řádek."),
  body("total").notEmpty().withMessage("Celková cena je povinná."),
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
