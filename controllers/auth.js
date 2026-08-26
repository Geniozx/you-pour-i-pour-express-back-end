const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = require('../db/database');

const saltRounds = 12;


router.post('/sign-in', async (req, res) => {
  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [req.body.username]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ err: 'Invalid credentials.' });
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      user.hashed_password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ err: 'Invalid credentials.' });
    }

    const payload = { 
      username: user.username, 
      id: user.id,
      role: user.role
     };


    const token = jwt.sign(
      { payload },
      process.env.JWT_SECRET
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
