const express = require('express');
const router = express.Router();

const {
  createBookingRequest,
  getAllBookingRequests
} = require('../controllers/bookingRequestsController');

router.get("/", getAllBookingRequests);
router.post("/", createBookingRequest);

module.exports = router;