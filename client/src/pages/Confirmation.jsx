import { Link, useLocation } from "react-router-dom";

function Confirmation() {
  const location = useLocation();

  const bookingRequest = location.state?.bookingRequest;

  if (!bookingRequest) {
    return (
      <div className="confirmation-page">
        <section className="confirmation-empty">
          <div className="confirmation-logo-placeholder">
            Brand Logo
          </div>

          <p className="confirmation-eyebrow">
            Confirmation
          </p>

          <h2 className="confirmation-title">
            No Booking Confirmation Found
          </h2>

          <p className="confirmation-message">
            No booking confirmation was found.
          </p>

          <Link
            className="confirmation-link"
            to="/"
          >
            Return Home →
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <section className="confirmation-content">
        <div className="confirmation-logo-placeholder">
          Brand Logo
        </div>

        <p className="confirmation-eyebrow">
          Booking Request Received
        </p>

        <h2 className="confirmation-title">
          Thank You, {bookingRequest.customer_name}.
        </h2>

        <div className="confirmation-number-section">
          <p className="confirmation-number-label">
            Your Confirmation Number
          </p>

          <h3 className="confirmation-number">
            {bookingRequest.confirmation_number}
          </h3>
        </div>

        <div className="confirmation-email">
          <p>
            A confirmation email has been sent to
          </p>

          <p className="confirmation-email-address">
            {bookingRequest.email}
          </p>
        </div>

        <Link
          className="confirmation-link"
          to="/"
        >
          Return Home →
        </Link>
      </section>
    </div>
  );
}

export default Confirmation;