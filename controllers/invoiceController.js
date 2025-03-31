const fs = require("fs").promises;
const path = require("path");
const mustache = require("mustache");
const puppeteer = require("puppeteer");
const QRCode = require("qrcode");
const createAppError = require("../utils/createAppError");

exports.generateInvoice = async (req, res, next) => {
  try {
    const data = req.body;

    if (data.header.payment_method === "převodem" && data.header.iban) {
      data.qr_code = await QRCode.toDataURL(
        `SPD*1.0*ACC:${data.header.iban}*AM:${data.total}*CC:CZK`
      );
      data.showIban = true;
    } else {
      data.showIban = false;
    }

    const columnCount = data.table.columns.length;
    data.columnWidth = (100 / columnCount).toFixed(2);

    const template = await fs.readFile(
      path.join(__dirname, "../views/invoice.mustache"),
      "utf8"
    );
    const html = mustache.render(template, data);

    const headerHTML = mustache.render(
      `
      <div style="font-size:16px; width:100%; text-align:left; padding: 0 40px; line-height: 1.6;">
        Dodavatel: {{header.supplier}}<br>
        Stanice: {{header.station}}<br>
        Datum: {{header.date}}<br>
        Splatnost: {{header.due_date}}<br>
        Č. objednávky: {{header.order_number}}<br>
        Platba: {{header.payment_method}}
      </div>
      `,
      data
    );

    const footerHTML = `
      <div style="font-size:11px; text-align:center; width:100%;">
        Strana <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const filename = `invoice-${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, "../invoices", filename);

    await page.pdf({
      path: outputPath,
      format: "A4",
      displayHeaderFooter: true,
      headerTemplate: headerHTML,
      footerTemplate: footerHTML,
      margin: { top: "50mm", bottom: "20mm", left: "10mm", right: "10mm" },
    });

    await browser.close();

    res.json({
      message: "✅ Faktura byla vygenerována",
      file: filename,
    });
  } catch (err) {
    next(createAppError("Chyba při generování faktury", 500));
  }
};
