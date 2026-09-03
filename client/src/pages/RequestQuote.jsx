import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function RequestQuote() {
  const [searchParams] = useSearchParams();
  const selectedService = searchParams.get("service");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState(
    selectedService || ""
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  

  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];


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
        "/api/booking-requests",
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
        console.error("Quote submission error:", err);

        setError(
          "We were unable to submit your request. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    }
    


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
        console.error(err);

        setError(
          "We were unable to load the available services."
        )
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
            "/api/booking-requests/availability",
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
          console.error(err);

          setError(
            "We were unable to check availability at this time."
          );

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
    <div className="quote-page">
      <section className="quote-header">
        <p className="quote-eyebrow">
          Request a Quote
        </p>

        <h2 className="quote-title">
          Tell Us About Your Event
        </h2>
      </section>

      <form
        className="quote-form"
        onSubmit={handleSubmit}
      >
        <section className="quote-form-section">
          <div className="quote-form-grid">
            <div className="quote-field">
              <label htmlFor="quote-name">
                Name
              </label>

              <input
                id="quote-name"
                type="text"
                value={name}
                placeholder="Enter Name"
                onChange={(event) => {
                  setName(event.target.value);
                }}
                required
              />
            </div>

            <div className="quote-field">
              <label htmlFor="quote-email">
                Email
              </label>

              <input
                id="quote-email"
                type="email"
                value={email}
                placeholder="Enter Email"
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                required
              />
            </div>

            <div className="quote-field">
              <label htmlFor="quote-phone">
                Phone
              </label>

              <input
                id="quote-phone"
                type="tel"
                value={phone}
                placeholder="Enter Phone Number"
                onChange={(event) => {
                  setPhone(event.target.value);
                }}
                required
              />
            </div>

            <div className="quote-field">
              <label htmlFor="quote-event-type">
                Event Type
              </label>

              <select
                id="quote-event-type"
                value={eventType}
                onChange={(event) => {
                  setEventType(event.target.value);
                }}
                required
              >
                <option value="">
                  Select Event Type
                </option>
                <option value="Wedding">
                  Wedding
                </option>
                <option value="Birthday">
                  Birthday
                </option>
                <option value="Corporate Event">
                  Corporate Event
                </option>
                <option value="Private Party">
                  Private Party
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </div>
          </div>
        </section>

        <section className="quote-form-section">
          <div className="quote-section-heading">
            <h3>Event Details</h3>
          </div>

          <div className="quote-form-grid">
            <div className="quote-field">
              <label htmlFor="quote-event-date">
                Event Date
              </label>

              <input
                id="quote-event-date"
                type="date"
                min={today}
                value={eventDate}
                onChange={(event) => {
                  setEventDate(event.target.value);
                }}
                required
              />
            </div>

            <div className="quote-field">
              <label htmlFor="quote-start-time">
                Event Start Time
              </label>

              <input
                id="quote-start-time"
                type="time"
                value={eventStartTime}
                onChange={(event) =>
                  setEventStartTime(event.target.value)
                }
                required
              />
            </div>

            <div className="quote-field">
              <label htmlFor="quote-end-time">
                Event End Time
              </label>

              <input
                id="quote-end-time"
                type="time"
                value={eventEndTime}
                onChange={(event) =>
                  setEventEndTime(event.target.value)
                }
                required
              />
            </div>

            <div className="quote-field">
              <label htmlFor="quote-location">
                Event Location
              </label>

              <input
                id="quote-location"
                type="text"
                value={eventLocation}
                placeholder="Enter Address"
                onChange={(event) => {
                  setEventLocation(event.target.value);
                }}
                required
              />
            </div>

            <div className="quote-field">
              <label htmlFor="quote-guest-count">
                Guest Count
              </label>

              <input
                id="quote-guest-count"
                type="number"
                min="1"
                value={guestCount}
                placeholder="How Many Guests?"
                onChange={(event) => {
                  setGuestCount(event.target.value);
                }}
                required
              />

              {guestCount !== "" &&
                Number(guestCount) <= 0 && (
                  <p className="quote-field-message quote-error">
                    Guest count must be greater than 0.
                  </p>
                )}
            </div>

            <div className="quote-field">
              <label htmlFor="quote-service">
                Service Package
              </label>

              <select
                id="quote-service"
                value={serviceId}
                onChange={(event) => {
                  setServiceId(event.target.value);
                }}
                required
              >
                <option value="">
                  Select a Service
                </option>

                {services.map((service) => (
                  <option
                    key={service.id}
                    value={service.id}
                  >
                    {service.name}
                  </option>
                ))}
              </select>

              {loading && (
                <p className="quote-field-message">
                  Loading services...
                </p>
              )}
            </div>
          </div>

          <div className="quote-availability">
            {checkingAvailability && (
              <p>Checking availability...</p>
            )}

            {availability === true && (
              <p className="quote-available">
                This date and time is available.
              </p>
            )}

            {availability === false && (
              <p className="quote-unavailable">
                This date or time is unavailable.
                Please choose another.
              </p>
            )}
          </div>
        </section>

        <section className="quote-form-section">
          <div className="quote-field quote-message-field">
            <label htmlFor="quote-message">
              Tell Us About Your Event
            </label>

            <textarea
              id="quote-message"
              value={message}
              placeholder="Tell us about your event"
              onChange={(event) => {
                setMessage(event.target.value);
              }}
              required
            />
          </div>
        </section>

        <div className="quote-form-footer">
          <button
            className="quote-submit-button"
            type="submit"
            disabled={
              submitting ||
              checkingAvailability ||
              availability === false
            }
          >
            {submitting
              ? "Submitting..."
              : "Request Quote →"}
          </button>
        </div>
      </form>

      {error && (
        <p className="quote-page-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default RequestQuote;