import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch(
          "/api/services"
        );

        if (!response.ok) {
          throw new Error("Services not found.");
        }

        const data = await response.json();

        setServices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);


  return (
    <div className="services-page">
      <section className="services-header">
        <h2 className="services-title">Services</h2>
      </section>

      {loading && (
        <p className="services-status">
          Loading services...
        </p>
      )}

      {error && (
        <p className="services-error">
          {error}
        </p>
      )}

      <section className="services-grid">
        {services.map((service) => (
          <article
            className="service-card"
            key={service.id}
          >
            <div className="service-card-content">
              <h3 className="service-card-title">
                {service.name}
              </h3>

              <p className="service-card-description">
                {service.description}
              </p>

              <p className="service-card-price">
                ${service.price}
              </p>

              <Link
                className="service-card-link"
                to={`/services/${service.id}`}
              >
                View Details →
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Services;