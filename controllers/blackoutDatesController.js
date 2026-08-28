const pool = require("../db/database");

async function getBlackoutDates(req, res) {
  try {
    const result = await pool.query(
      `SELECT
        id,
        start_date,
        end_date,
        reason,
        created_at
      FROM blackout_dates
      ORDER BY start_date ASC`
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}

async function createBlackoutDate(req, res) {
  try {
    const {
      start_date,
      end_date,
      reason
    } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({
        err: "Start date and end date are required."
      });
    }

    if (end_date < start_date) {
      return res.status(400).json({
        err: "End date cannot be before start date."
      });
    }

    const cleanedReason =
      typeof reason === "string" ? reason.trim() : "";

    const result = await pool.query(
      `INSERT INTO blackout_dates (
        start_date,
        end_date,
        reason
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        start_date,
        end_date,
        reason,
        created_at`,
      [
        start_date,
        end_date,
        cleanedReason
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}

async function deleteBlackoutDate(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM blackout_dates
      WHERE id = $1
      RETURNING
        id,
        start_date,
        end_date,
        reason`,
      [id]
    );

    const blackoutDate = result.rows[0];

    if (!blackoutDate) {
      return res.status(404).json({
        err: "Blackout date not found."
      });
    }

    res.status(200).json({
      message: "Blackout date removed.",
      blackoutDate
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}

module.exports = {
  getBlackoutDates,
  createBlackoutDate,
  deleteBlackoutDate
};