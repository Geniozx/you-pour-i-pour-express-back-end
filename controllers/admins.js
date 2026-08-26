const bcrypt = require("bcrypt");
const pool = require("../db/database");

async function createAdmin(req, res) {
  try {
    const { username, password } = req.body;

    const cleanedUsername =
      typeof username === "string" ? username.trim() : "";

    if (!cleanedUsername || !password) {
      return res.status(400).json({
        err: "Username and password are required."
      });
    }

    const existingUser = await pool.query(
      `SELECT id
       FROM users
       WHERE username = $1`,
      [cleanedUsername]
    );

    if (existingUser.rows[0]) {
      return res.status(409).json({
        err: "Username already exists."
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 12);

    const result = await pool.query(
      `INSERT INTO users (
        username,
        hashed_password,
        role
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        username,
        role`,
      [cleanedUsername, hashedPassword, "admin"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({
      err: err.message
    });
  }
}

module.exports = {
  createAdmin
};