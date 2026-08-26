const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/verify-token");
const requireAdmin = require("../middleware/require-admin");

const {
  createAdmin
} = require("../controllers/admins");

router.post(
    "/",
    verifyToken,
    requireAdmin,
    createAdmin
);

module.exports = router;