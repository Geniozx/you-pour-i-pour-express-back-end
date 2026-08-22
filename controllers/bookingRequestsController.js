const pool = require('../db/database');


async function createBookingRequest(req, res) {
  try {
    const {
      customer_name,
      email,
      phone,
      event_date,
      event_type,
      event_location,
      guest_count,
      service_id,
      message
    } = req.body;

    if (
        !customer_name ||
        !email ||
        !phone ||
        !event_date ||
        !event_location ||
        !guest_count ||
        !service_id ||
        !message
    ) {
        return res.status(400).json({
            err: "All fields are required."
        });
    }

    if (guest_count <= 0) {
        return res.status(400).json({
            err: "Guest count must be greater than 0."
        });
    }

    const serviceResult = await pool.query(
        "SELECT id FROM services WHERE id = $1",
        [service_id]
    );

    const service = serviceResult.rows[0];

    if (!service) {
        return res.status(400).json({
        err: "Invalid service."
        });
    }

    const bookingResult = await pool.query(
      `INSERT INTO booking_requests (
        customer_name,
        email,
        phone,
        event_date,
        event_type,
        event_location,
        guest_count,
        service_id,
        message
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        customer_name,
        email,
        phone,
        event_date,
        event_type,
        event_location,
        guest_count,
        service_id,
        message
      ]
    );

    const bookingRequest = bookingResult.rows[0];

    res.status(201).json(bookingRequest);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}




async function getAllBookingRequests(req, res) {
  try {
    const bookingResult = await pool.query(
      `SELECT *
       FROM booking_requests
       WHERE id = $1`,
       [req.params.id]
    );

    const bookingRequests = bookingResult.rows[0];

    res.status(200).json(bookingRequests);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}





async function getBookingRequestById(req, res) {
  try {
    const bookingResult = await pool.query(
      `SELECT *
       FROM booking_requests
       WHERE id = $1`,
      [req.params.id]
    );

    const bookingRequest = bookingResult.rows[0];

    if (!bookingRequest) {
      return res.status(404).json({
        err: "Booking request not found."
      });
    }

    res.status(200).json(bookingRequest);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}






async function updateBookingRequestStatus(req, res) {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "new",
      "contacted",
      "confirmed",
      "declined"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        err: "Invalid status."
      });
    }

    const bookingResult = await pool.query(
      `UPDATE booking_requests
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );

    const bookingRequest = bookingResult.rows[0];

    if (!bookingRequest) {
      return res.status(404).json({
        err: "Booking request not found."
      });
    }

    res.status(200).json(bookingRequest);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}

module.exports = {
  createBookingRequest,
  getAllBookingRequests,
  getBookingRequestById,
  updateBookingRequestStatus
};