import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function AdminBookingDetails() {
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [resending, setResending] = useState(false);
    const [emailMessage, setEmailMessage] = useState("");
    const [notes, setNotes] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);
    const [notesMessage, setNotesMessage] = useState("");

    const { id } = useParams();
    const navigate = useNavigate();


    function formatDate(date) {
        if (!date) {
            return "";
        }

        return date.split("T")[0];
        }

        function formatTime(time) {
        if (!time) {
            return "";
        }

        const [hours, minutes] = time.split(":");
        const hour = Number(hours);
        const period = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 || 12;

        return `${formattedHour}:${minutes} ${period}`;
    }

    useEffect(() => {
        async function fetchBooking() {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            try {
                const response = await fetch(
                    `/api/booking-requests/${id}`,
                    {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                    }
                );

                if (response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/admin/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error("Unable to load booking request.");
                }

                const data = await response.json();

                setBooking(data);
                setNotes(data.admin_notes || "");
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
            }
        }

            fetchBooking();
    }, [id, navigate]);

    if (loading) {
        return <p>Loading booking...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!booking) {
        return <p>Booking request not found.</p>;
    }

    async function handleStatusChange(event) {
        const newStatus = event.target.value;
        const token = localStorage.getItem("token");

        setUpdating(true);
        setStatusMessage("");

        try {
            const response = await fetch(
            `/api/booking-requests/${id}`,
            {
                method: "PATCH",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                status: newStatus
                })
            }
            );

            if (response.status === 401) {
                localStorage.removeItem("token");
                navigate("/admin/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.err || "Unable to update booking status.");
            }

            setBooking(data);
            setStatusMessage("Booking status updated.");
        } catch (err) {
            setStatusMessage(err.message);
        } finally {
            setUpdating(false);
        }
    }


    async function handleSaveNotes() {
        const token = localStorage.getItem("token");

        setSavingNotes(true);
        setNotesMessage("");

        try {
            const response = await fetch(
            `/api/booking-requests/${id}/notes`,
            {
                method: "PATCH",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                admin_notes: notes
                })
            }
            );

            if (response.status === 401) {
                localStorage.removeItem("token");
                navigate("/admin/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.err || "Unable to save admin notes."
                );
            }

            setBooking(data);
            setNotes(data.admin_notes || "");
            setNotesMessage("Admin notes saved.");
        } catch (err) {
            setNotesMessage(err.message);
        } finally {
            setSavingNotes(false);
        }
    }


    async function handleResendConfirmation() {
        const token = localStorage.getItem("token");

        setResending(true);
        setEmailMessage("");

        try {
            const response = await fetch(
            `/api/booking-requests/${id}/resend-confirmation`,
            {
                method: "POST",
                headers: {
                Authorization: `Bearer ${token}`
                }
            }
            );

            if (response.status === 401) {
                localStorage.removeItem("token");
                navigate("/admin/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.err || "Unable to resend confirmation email."
                );
            }

            setBooking(data.bookingRequest);
            setEmailMessage(data.message);
        } catch (err) {
            setEmailMessage(err.message);
        } finally {
            setResending(false);
        }
    }

    return (
        <div className="admin-booking-page">
            <section className="admin-booking-header">
            <p className="admin-eyebrow">
                Booking Request
            </p>

            <h2 className="admin-booking-title">
                {booking.customer_name}
            </h2>

            <p className="admin-booking-confirmation">
                Confirmation: {booking.confirmation_number}
            </p>
            </section>

            <section className="admin-booking-info">
            <div className="admin-booking-info-item">
                <span>Email</span>
                <p>{booking.email}</p>
            </div>

            <div className="admin-booking-info-item">
                <span>Phone</span>
                <p>{booking.phone}</p>
            </div>

            <div className="admin-booking-info-item">
                <span>Event Type</span>
                <p>{booking.event_type}</p>
            </div>

            <div className="admin-booking-info-item">
                <span>Event Date</span>
                <p>{formatDate(booking.event_date)}</p>
            </div>

            <div className="admin-booking-info-item">
                <span>Start Time</span>
                <p>{formatTime(booking.event_start_time)}</p>
            </div>

            <div className="admin-booking-info-item">
                <span>End Time</span>
                <p>{formatTime(booking.event_end_time)}</p>
            </div>

            <div className="admin-booking-info-item">
                <span>Event Location</span>
                <p>{booking.event_location}</p>
            </div>

            <div className="admin-booking-info-item">
                <span>Guest Count</span>
                <p>{booking.guest_count}</p>
            </div>

            <div className="admin-booking-info-item">
                <span>Service</span>
                <p>{booking.service_name}</p>
            </div>

            <div className="admin-booking-info-item">
                <span>Email Status</span>
                <p>{booking.email_status}</p>
            </div>

            <div className="admin-booking-info-item admin-booking-message">
                <span>Customer Message</span>
                <p>{booking.message}</p>
            </div>
            </section>

            <section className="admin-booking-actions">
            <div className="admin-action-section">
                <h3>Booking Status</h3>

                <select
                className="admin-status-select"
                value={booking.status}
                onChange={handleStatusChange}
                disabled={updating}
                >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="confirmed">Confirmed</option>
                <option value="reserved">Reserved</option>
                <option value="declined">Declined</option>
                </select>

                {updating && (
                <p className="admin-action-message">
                    Updating status...
                </p>
                )}

                {statusMessage && (
                <p className="admin-action-message">
                    {statusMessage}
                </p>
                )}
            </div>

            <div className="admin-action-section">
                <h3>Admin Notes</h3>

                <textarea
                className="admin-notes-textarea"
                value={notes}
                placeholder="Add internal notes about this booking..."
                onChange={(event) => {
                    setNotes(event.target.value);
                }}
                />

                <button
                className="admin-action-button"
                type="button"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                >
                {savingNotes ? "Saving..." : "Save Notes →"}
                </button>

                {notesMessage && (
                <p className="admin-action-message">
                    {notesMessage}
                </p>
                )}
            </div>

            <div className="admin-action-section">
                <h3>Email Confirmation</h3>

                <p className="admin-email-status">
                Current Status: {booking.email_status}
                </p>

                <button
                className="admin-action-button"
                type="button"
                onClick={handleResendConfirmation}
                disabled={resending}
                >
                {resending
                    ? "Resending..."
                    : "Resend Confirmation Email →"}
                </button>

                {emailMessage && (
                <p className="admin-action-message">
                    {emailMessage}
                </p>
                )}
            </div>
            </section>

            <div className="admin-booking-footer">
            <Link
                className="admin-return-link"
                to="/admin/dashboard"
            >
                ← Return to Dashboard
            </Link>
            </div>
        </div>
    );
}

export default AdminBookingDetails;