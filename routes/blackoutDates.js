const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verify-token");

const {
  getBlackoutDates,
  createBlackoutDate,
  deleteBlackoutDate
} = require("../controllers/blackoutDatesController");

router.get("/", verifyToken, getBlackoutDates);

router.post("/", verifyToken, createBlackoutDate);

router.delete("/:id", verifyToken, deleteBlackoutDate);

module.exports = router;