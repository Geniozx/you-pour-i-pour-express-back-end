const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const logger = require('morgan');

const testJwtRouter = require('./controllers/test-jwt');
const authController = require('./controllers/auth');
const usersRouter = require('./controllers/users.js')
const servicesRouter = require('./routes/services');
const bookingRequestsRouter = require('./routes/bookingRequests.js')

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger('dev'));

// Routes go here
app.use('/auth', authController);
app.use('/test-jwt', testJwtRouter);
app.use('/users', usersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/booking-requests', bookingRequestsRouter);


app.get("/", (req, res) => {
  res.json({ message: "You Party - I Pour API" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});