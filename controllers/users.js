// controllers/users.js

const express = require('express');
const router = express.Router();


const pool = require('../db/database');

const verifyToken = require('../middleware/verify-token');


router.get('/', verifyToken, async (req, res) => {
  try {
    // Get a list of all users, but only return their username and id
    const usersResult = await pool.query(
      "SELECT id, username FROM users"
    );

    const users = usersResult.rows;

    res.json(users);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});






router.get('/:userId', verifyToken, async (req, res) => {
  try {
    // If the user is looking for the details of another user, block the request
    // Send a 403 status code to indicate that the user is unauthorized
    if (req.user.id !== Number(req.params.userId)) {
      return res.status(403).json({ err: "Unauthorized" });
    }

    const userResult = await pool.query(
      "SELECT id, username FROM users WHERE id = $1",
      [req.params.userId]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ 
        err: 'User not found.'
      });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


module.exports = router;
