// /controllers/auth.js
const express = require('express');
const router = express.Router();
// Import bcrypt for password hashing
const bcrypt = require('bcrypt');
// Add jsonwebtoken import
const jwt = require('jsonwebtoken');

const pool = require('../db/database');

// Add in constant for the number of rounds 
const saltRounds = 12;

router.post('/sign-up', async (req, res) => {
  try {
    // Check if the username is already taken
    const existingUserResult = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [req.body.username]
    );

    const userInDatabase = existingUserResult.rows[0];

    if (userInDatabase) {
      return res.status(409).json({
        err: 'Username already taken.'
      });
    }

    // Create a new user with hashed password
    const hashedPassword = bcrypt.hashSync(
      req.body.password,
      saltRounds
    );

    const newUserResult = await pool.query(
      `INSERT INTO users (username, hashed_password)
      VALUES ($1, $2)
      RETURNING id, username`,
      [req.body.username, hashedPassword]
    );

    const user = newUserResult.rows[0];

    // Construct the payload
    const payload = { username: user.username, id: user.id };

    // Create the token, attaching the payload
    const token = jwt.sign({ payload }, process.env.JWT_SECRET);

    res.status(201).json({ token });
  } catch (err) {
    // Send the error message to the client
    res.status(400).json({ err: err.message });
  }
});




router.post('/sign-in', async (req, res) => {
  try {
    // Look up the user by their username in the database
    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [req.body.username]
    );

    const user = userResult.rows[0];
    // If the user doesn't exist, return a 401 status code with a message
    if (!user) {
      return res.status(401).json({ err: 'Invalid credentials.' });
    }
    

     // Check if the password is correct using bcrypt
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      user.hashed_password
    );
    // If the password is incorrect, return a 401 status code with a message
    if (!isPasswordCorrect) {
      return res.status(401).json({ err: 'Invalid credentials.' });
    }

     // Construct the payload
    const payload = { username: user.username, id: user.id };

    // Create the token, attaching the payload
    const token = jwt.sign({ payload }, process.env.JWT_SECRET);

    // Send the token instead of the message
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
