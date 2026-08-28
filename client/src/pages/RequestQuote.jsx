import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function RequestQuote() {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  

  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const selectedService = searchParams.get("service");
  const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
      if (selectedService) {
        setServiceId(selectedService);
      }
    }, [selectedService]);

    async function handleSubmit(event) {
      event.preventDefault();


      setError("");
      setSubmitting(true);


      const quoteData = {
        customer_name: name,
        email,
        phone,
        event_date: eventDate,
        event_start_time: eventStartTime,
        event_end_time: eventEndTime,
        event_type: eventType,
        event_location: eventLocation,
        guest_count: Number(guestCount),
        service_id: Number(serviceId),
        message
      };


      try {
        const response = await fetch(
        "http://localhost:3000/api/booking-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(quoteData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.err);
      }
      
      const data = await response.json();
      
      navigate("/confirmation", {
        state: {
          bookingRequest: data
        }
      });

    } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    }
    


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


    useEffect(() => {
      async function checkAvailability() {
        if (
          !eventDate ||
          !eventStartTime ||
          !eventEndTime
        ) {
          setAvailability(null);
          return;
        }

        if (eventEndTime <= eventStartTime) {
          setAvailability(null);
          return;
        }

        try {
          setCheckingAvailability(true);
          setAvailability(null);

          const response = await fetch(
            "http://localhost:3000/api/booking-requests/availability",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                event_date: eventDate,
                event_start_time: eventStartTime,
                event_end_time: eventEndTime
              })
            }
          );

          if (!response.ok) {
            throw new Error("Could not check availability.");
          }

          const data = await response.json();

          setAvailability(data.available);
        } catch (err) {
          setError(err.message);
          setAvailability(null);
        } finally {
          setCheckingAvailability(false);
        }
      }

      checkAvailability();
    }, [
      eventDate,
      eventStartTime,
      eventEndTime
    ]);


  return (
    <div>
      <h2>Request A Quote</h2>

      <form onSubmit={handleSubmit}>
        <label>Name: </label>
        <input 
          type="text"
          value={name}
          placeholder="Enter Name"
          onChange={(event) => {
            setName(event.target.value);
          }}
          required
        />


        <label>Email: </label>
        <input
          type="email"
          value={email}
          placeholder="Enter Email"
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          required
        />


        <label>Event Date: </label>
        <input 
          type="date"
          min={today}
          value={eventDate}
          onChange={(event) => {
            setEventDate(event.target.value);
          }}
          required
        />


        <label>
          Event Start Time
          <input
            type="time"
            value={eventStartTime}
            onChange={(event) => setEventStartTime(event.target.value)}
            required
          />
        </label>

        <label>
          Event End Time
          <input
            type="time"
            value={eventEndTime}
            onChange={(event) => setEventEndTime(event.target.value)}
            required
          />
        </label>

        {checkingAvailability && (
          <p>Checking availability...</p>
        )}

        {availability === true && (
          <p>This date and time is available.</p>
        )}

        {availability === false && (
          <p>
            This date or time is unavailable. Please choose another.
          </p>
        )}

        <label>Phone: </label>
        <input
          type="tel"
          value={phone}
          placeholder="Enter Phone Number"
          onChange={(event) => {
            setPhone(event.target.value)
          }}
          required
        />


        <label>Event Type: </label>
        <select 
          value={eventType}
          onChange={(event) => {
            setEventType(event.target.value);
          }}
          required
        >
          <option value="">Select Event Type</option>
          <option value="Wedding">Wedding</option>
          <option value="Birthday">Birthday</option>
          <option value="Corporate Event">Corporate Event</option>
          <option value="Private Party">Private Party</option>
          <option value="Other">Other</option>
        </select>


        <label>Event Location: </label>
        <input
          type="text"
          value={eventLocation}
          placeholder="Enter Address"
          onChange={(event) => {
            setEventLocation(event.target.value);
          }}
          required
        />


        <label>Guest Count: </label>
        <input 
          type="number"
          min="1"
          value={guestCount}
          placeholder="How Many Guests?"
          onChange={(event) => {
            setGuestCount(event.target.value);
          }}
          required
        />
        {guestCount !== "" && Number(guestCount) <= 0 && (
          <p>Guest count must be greater than 0.</p>
        )}


        <label>Services Package: </label>
        <select 
          value={serviceId}
          onChange={(event) => {
            setServiceId(event.target.value);
          }}
          required
        >
          <option value="">Select a Service</option>

          {services.map((service) => (
            <option
              key={service.id}
              value={service.id}
            >
              {service.name}
            </option>
          ))}
        </select>
        {loading && <p>Loading services...</p>}


        <label>Message: </label>
        <textarea
          value={message}
          placeholder="Tell us about your event"
          onChange={(event) => {
            setMessage(event.target.value);
          }}
          required
        />

        <br />
        <button 
          type="submit"
          disabled={
            submitting ||
            checkingAvailability ||
            availability === false
          }
        > 
          {submitting ? "Submitting..." : "Request Quote"} 
        </button>
      </form>

      
      {error && <p>{error}</p>}
    </div>
  );
}

export default RequestQuote;