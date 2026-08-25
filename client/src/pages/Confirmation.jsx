import { Link } from "react-router-dom";


function Confirmation() {
  return (
    <div>
      <h2>Request Received!</h2>

      <p>
        Thank you for contacting You Party - I Pour.
      </p>

      <p>
        We've received your event request and will contact you
        to confirm availability and discuss the details.
      </p>

      <Link to="/">
        Back to Home
      </Link>
    </div>
  );
}

export default Confirmation;