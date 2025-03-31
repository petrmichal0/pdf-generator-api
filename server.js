const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.error(`❌ UNCAUGHT EXCEPTION! Server se vypíná...\n${err.stack}`);
  process.exit(1);
});

dotenv.config();
const app = require("./app");

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`✅ PDF API běží na portu ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`❌ UNHANDLED REJECTION! Server se vypíná...\n${err.stack}`);
  server.close(() => process.exit(1));
});
