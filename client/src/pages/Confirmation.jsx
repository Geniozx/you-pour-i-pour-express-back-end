import { Link, useLocation } from "react-router-dom";


function Confirmation() {
  const location = useLocation();

  const bookingRequest = location.state?.bookingRequest;

  if (!bookingRequest) {
    return (
      <div>
        <h2>Confirmation</h2>
        <p>No booking confirmation was found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Booking Request Received</h2>

      <p>Thank you, {bookingRequest.customer_name}.</p>

      <p>Your confirmation number is:</p>

      <h3>{bookingRequest.confirmation_number}</h3>

      <p>
        A confirmation email has been sent to {bookingRequest.email}.
      </p>

      <Link to="/">Return Home</Link>
    </div>
  );
}

export default Confirmation;