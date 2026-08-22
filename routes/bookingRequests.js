const express = require('express');
const router = express.Router();

const {
  createBookingRequest,
  getAllBookingRequests,
  getBookingRequestById,
  updateBookingRequestStatus
} = require('../controllers/bookingRequestsController');

router.get("/", getAllBookingRequests);
router.get("/:id", getBookingRequestById);
router.post("/", createBookingRequest);
router.patch("/:id", updateBookingRequestStatus);

module.exports = router;