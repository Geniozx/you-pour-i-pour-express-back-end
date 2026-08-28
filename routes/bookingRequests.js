const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/verify-token');

const {
  createBookingRequest,
  getAllBookingRequests,
  getBookingRequestById,
  updateBookingRequestStatus,
  resendConfirmationEmail,
  updateBookingRequestNotes,
  checkBookingAvailability
} = require('../controllers/bookingRequestsController');

router.post("/", createBookingRequest);

router.get("/", verifyToken, getAllBookingRequests);
router.get("/:id", verifyToken, getBookingRequestById);
router.patch("/:id", verifyToken, updateBookingRequestStatus);
router.patch("/:id/notes", verifyToken, updateBookingRequestNotes)
router.post("/:id/resend-confirmation", verifyToken, resendConfirmationEmail);
router.post("/availability", checkBookingAvailability);

module.exports = router;