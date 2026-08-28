const pool = require('../db/database');
const generateConfirmationNumber = require(
  "../utils/generateConfirmationNumber.js"
)
const sendConfirmationEmail = require(
  "../utils/sendConfirmationEmail"
);


async function createBookingRequest(req, res) {
  try {
    const {
      customer_name,
      email,
      phone,
      event_date,
      event_start_time,
      event_end_time,
      event_type,
      event_location,
      guest_count,
      service_id,
      message
    } = req.body;

    const cleanedName =
      typeof customer_name === "string" ? customer_name.trim() : "";

    const cleanedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    const cleanedPhone =
      typeof phone === "string" ? phone.trim() : "";

    const cleanedEventType =
      typeof event_type === "string" ? event_type.trim() : "";

    const cleanedEventLocation =
      typeof event_location === "string" ? event_location.trim() : "";

    const cleanedMessage =
      typeof message === "string" ? message.trim() : "";

    if (
      !cleanedName ||
      !cleanedEmail ||
      !cleanedPhone ||
      !event_date ||
      !event_start_time ||
      !event_end_time ||
      !cleanedEventType ||
      !cleanedEventLocation ||
      !guest_count ||
      !service_id ||
      !cleanedMessage
    ) {
      return res.status(400).json({
        err: "All fields are required."
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanedEmail)) {
      return res.status(400).json({
        err: "Please enter a valid email address."
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

    if (event_end_time <= event_start_time) {
      return res.status(400).json({
        err: "Event end time must be after the start time."
      });
    }


    const blackoutResult = await pool.query(
      `SELECT id
      FROM blackout_dates
      WHERE $1::date BETWEEN start_date AND end_date
      LIMIT 1`,
      [event_date]
    );

    if (blackoutResult.rows.length > 0) {
      return res.status(409).json({
        err: "This date is unavailable. Please choose another date."
      });
    }

    const conflictResult = await pool.query(
      `SELECT id
      FROM booking_requests
      WHERE event_date = $1
        AND status IN ('reserved', 'confirmed')
        AND event_start_time < $3
        AND event_end_time > $2
      LIMIT 1`,
      [
        event_date,
        event_start_time,
        event_end_time
      ]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(409).json({
        err: "This time is unavailable. Please choose another time."
      });
    }

    const confirmationNumber = generateConfirmationNumber();

    const bookingResult = await pool.query(
      `INSERT INTO booking_requests (
        customer_name,
        email,
        phone,
        event_date,
        event_start_time,
        event_end_time,
        event_type,
        event_location,
        guest_count,
        service_id,
        message,
        confirmation_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING
        id,
        customer_name,
        email,
        event_date,
        event_start_time,
        event_end_time,
        event_type,
        event_location,
        guest_count,
        service_id,
        confirmation_number`,
      [
        cleanedName,
        cleanedEmail,
        cleanedPhone,
        event_date,
        event_start_time,
        event_end_time,
        cleanedEventType,
        cleanedEventLocation,
        guest_count,
        service_id,
        cleanedMessage,
        confirmationNumber
      ]
    );

    const bookingRequest = bookingResult.rows[0];

    let emailStatus = "sent";

    try {
      await sendConfirmationEmail(bookingRequest);
    } catch (emailErr) {
      emailStatus = "failed";

      console.error(
        "Confirmation email failed:",
        emailErr.message
      );
    }

    await pool.query(
      `UPDATE booking_requests
      SET email_status = $1
      WHERE id = $2`,
      [emailStatus, bookingRequest.id]
    );

    bookingRequest.email_status = emailStatus;

    res.status(201).json(bookingRequest);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}




async function getAllBookingRequests(req, res) {
  try {
    const bookingResult = await pool.query(
      `SELECT
        booking_requests.*,
        services.name AS service_name
      FROM booking_requests
      JOIN services
        ON booking_requests.service_id = services.id
      ORDER BY booking_requests.id DESC`
    );

    res.status(200).json(bookingResult.rows);
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
}





async function getBookingRequestById(req, res) {
  try {
    const bookingResult = await pool.query(
      `SELECT
        booking_requests.*,
        services.name AS service_name
      FROM booking_requests
      JOIN services
        ON booking_requests.service_id = services.id
      WHERE booking_requests.id = $1`,
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
      "reserved",
      "confirmed",
      "declined"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        err: "Invalid status."
      });
    }


    if (status === "reserved" || status === "confirmed") {
      const currentBookingResult = await pool.query(
        `SELECT
          id,
          event_date,
          event_start_time,
          event_end_time
        FROM booking_requests
        WHERE id = $1`,
        [req.params.id]
      );

      const currentBooking = currentBookingResult.rows[0];

      if (!currentBooking) {
        return res.status(404).json({
          err: "Booking request not found."
        });
      }

      const blackoutResult = await pool.query(
        `SELECT id
        FROM blackout_dates
        WHERE $1::date BETWEEN start_date AND end_date
        LIMIT 1`,
        [currentBooking.event_date]
      );

      if (blackoutResult.rows.length > 0) {
        return res.status(409).json({
          err: "This booking falls on an unavailable date."
        });
      }

      const conflictResult = await pool.query(
        `SELECT id
        FROM booking_requests
        WHERE event_date = $1
          AND status IN ('reserved', 'confirmed')
          AND id <> $2
          AND event_start_time < $4
          AND event_end_time > $3
        LIMIT 1`,
        [
          currentBooking.event_date,
          currentBooking.id,
          currentBooking.event_start_time,
          currentBooking.event_end_time
        ]
      );

      if (conflictResult.rows.length > 0) {
        return res.status(409).json({
          err: "This booking conflicts with another reserved or confirmed event."
        });
      }
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


async function updateBookingRequestNotes(req, res) {
  try {
    const { admin_notes } = req.body;

    const cleanedNotes =
      typeof admin_notes === "string"
        ? admin_notes.trim()
        : "";

    const bookingResult = await pool.query(
      `UPDATE booking_requests
       SET admin_notes = $1
       WHERE id = $2
       RETURNING *`,
      [cleanedNotes, req.params.id]
    );

    const bookingRequest = bookingResult.rows[0];

    if (!bookingRequest) {
      return res.status(404).json({
        err: "Booking request not found."
      });
    }

    res.status(200).json(bookingRequest);
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
}


async function resendConfirmationEmail(req, res) {
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

    try {
      await sendConfirmationEmail(bookingRequest);

      await pool.query(
        `UPDATE booking_requests
         SET email_status = 'sent'
         WHERE id = $1`,
        [bookingRequest.id]
      );

      bookingRequest.email_status = "sent";

      return res.status(200).json({
        message: "Confirmation email resent successfully.",
        bookingRequest
      });
    } catch (emailErr) {
      await pool.query(
        `UPDATE booking_requests
         SET email_status = 'failed'
         WHERE id = $1`,
        [bookingRequest.id]
      );

      console.error(
        "Confirmation email resend failed:",
        emailErr.message
      );

      return res.status(500).json({
        err: "Confirmation email could not be resent."
      });
    }
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
}


async function checkBookingAvailability(req, res) {
  try {
    const {
      event_date,
      event_start_time,
      event_end_time
    } = req.body;

    if (
      !event_date ||
      !event_start_time ||
      !event_end_time
    ) {
      return res.status(400).json({
        err: "Event date, start time, and end time are required."
      });
    }

    if (event_end_time <= event_start_time) {
      return res.status(400).json({
        err: "Event end time must be after the start time."
      });
    }

    const blackoutResult = await pool.query(
      `SELECT id
      FROM blackout_dates
      WHERE $1::date BETWEEN start_date AND end_date
      LIMIT 1`,
      [event_date]
    );

    if (blackoutResult.rows.length > 0) {
      return res.status(200).json({
        available: false
      });
    }

    const conflictResult = await pool.query(
      `SELECT id
      FROM booking_requests
      WHERE event_date = $1
        AND status IN ('reserved', 'confirmed')
        AND event_start_time < $3
        AND event_end_time > $2
      LIMIT 1`,
      [
        event_date,
        event_start_time,
        event_end_time
      ]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(200).json({
        available: false
      });
    }

    res.status(200).json({
      available: true
    });
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
}


module.exports = {
  createBookingRequest,
  getAllBookingRequests,
  getBookingRequestById,
  updateBookingRequestStatus,
  resendConfirmationEmail,
  updateBookingRequestNotes,
  checkBookingAvailability
};