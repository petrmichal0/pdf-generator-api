const fs = require("fs").promises;
const path = require("path");
const mustache = require("mustache");
const puppeteer = require("puppeteer");
const createAppError = require("../utils/createAppError");

exports.generateTransactions = async (req, res, next) => {
  try {
    const data = req.body;

    const columnCount = data.table.columns.length;
    data.columnWidth = (100 / columnCount).toFixed(2);

    const template = await fs.readFile(
      path.join(__dirname, "../views/transactions.mustache"),
      "utf8"
    );
    const html = mustache.render(template, data);

    const headerHTML = mustache.render(
      `
      <div style="font-size:16px; width:100%; text-align:left; padding: 0 40px; line-height: 1.6;">
        {{#header.title}}{{header.title}}<br>{{/header.title}}
        {{#header.period}}Období: {{header.period}}<br>{{/header.period}}
      </div>
      `,
      data
    );

    const footerHTML = `
      <div style="font-size:11px; text-align:center; width:100%;">
        Strana <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `;

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const filename = `transactions-${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, "../transactions", filename);

    await page.pdf({
      path: outputPath,
      format: "A4",
      displayHeaderFooter: true,
      headerTemplate: headerHTML,
      footerTemplate: footerHTML,
      margin: { top: "20mm", bottom: "20mm", left: "10mm", right: "10mm" },
    });

    await browser.close();

    res.json({
      message: "✅ Seznam transakcí byl vygenerován",
      file: filename,
    });
  } catch (err) {
    next(createAppError("Chyba při generování transakcí", 500));
  }
};
