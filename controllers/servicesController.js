const pool = require('../db/database');

async function getAllServices(req, res) {
  try {
    const servicesResult = await pool.query(
      `SELECT id, name, description, price, is_active
       FROM services
       WHERE is_active = TRUE
       ORDER BY id`
    );

    const services = servicesResult.rows;

    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}


async function getServiceById(req, res) {
  try {
    const serviceResult = await pool.query(
      `SELECT id, name, description, price, is_active
       FROM services
       WHERE id = $1`,
      [req.params.id]
    );

    const service = serviceResult.rows[0];

    if (!service) {
      return res.status(404).json({
        err: "Service not found."
      });
    }

    res.status(200).json(service);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}

module.exports = {
    getAllServices,
    getServiceById
};