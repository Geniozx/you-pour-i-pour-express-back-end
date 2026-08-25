const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT),
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});

async function sendConfirmationEmail(bookingRequest) {
  // transporter + email config will go here
  await transporter.sendMail({
    from: `"You Party - I Pour" <bookings@youpartyipour.com>`,
    to: bookingRequest.email,
    subject: `Booking Request Confirmation - ${bookingRequest.confirmation_number}`,
    text: `
Hi ${bookingRequest.customer_name},

Thank you for submitting your booking request to You Party - I Pour.

Confirmation Number: ${bookingRequest.confirmation_number}

Event Date: ${bookingRequest.event_date}
Event Type: ${bookingRequest.event_type}
Event Location: ${bookingRequest.event_location}
Guest Count: ${bookingRequest.guest_count}

We received your request and will follow up with you soon.

You Party - I Pour
    `
  });
}

module.exports = sendConfirmationEmail;