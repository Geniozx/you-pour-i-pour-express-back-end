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
          "http://localhost:3000/api/services"
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
    <div>
      <h2>Services</h2>

      {loading && <p>Loading services...</p>}
      {error && <p>{error}</p>}

      {services.map((service) => (
        // JSX
        <div key={service.id}>
          <h3>{service.name}</h3>
          <p>{service.description}</p>
          <p>${service.price}</p>
        

          <Link to={`/services/${service.id}`}>
            View Details 
          </Link>
        </div>
      ))}
    </div>
  );
}

export default Services;