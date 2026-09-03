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
          `/api/services/${id}`
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
    <div className="service-details-page">
      <section className="service-details-header">
        <p className="service-details-eyebrow">
          Service Details
        </p>

        <h2 className="service-details-title">
          {service.name}
        </h2>
      </section>

      <section className="service-details-content">
        <div className="service-details-description">
          <p>{service.description}</p>
        </div>

        <div className="service-details-meta">
          <p className="service-details-price">
            ${service.price}
          </p>

          <div className="service-details-actions">
            <Link
              className="service-details-link"
              to="/services"
            >
              ← Back to Services
            </Link>

            <Link
              className="service-details-link service-details-quote-link"
              to={`/request-quote?service=${service.id}`}
            >
              Request a Quote →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ServiceDetails;