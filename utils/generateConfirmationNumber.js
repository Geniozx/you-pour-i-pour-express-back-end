const crypto = require("crypto");

function generateConfirmationNumber() {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  const randomCode = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase();

  return `YPIP-${date}-${randomCode}`;
}

module.exports = generateConfirmationNumber;