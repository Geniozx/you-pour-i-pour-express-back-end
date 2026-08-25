import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";


function ServiceDetails() {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchService() {
      try {
        const response = await fetch(
          `http://localhost:3000/api/services/${id}`
        );

        if (!response.ok) {
          throw new Error("Service not found.");
        }

        const data = await response.json();

        setService(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [id]);

  if (loading) {
    return <p>Loading service...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
  <div>
    <h2>Service Details</h2>

    <h3>{service.name}</h3>
    <p>{service.description}</p>
    <p>${service.price}</p>

    <Link to={"/services"}>
      Back to Services
    </Link>

    <Link to={`/request-quote?service=${service.id}`}>
      Request a Quote
    </Link>
  </div>
);
}

export default ServiceDetails;