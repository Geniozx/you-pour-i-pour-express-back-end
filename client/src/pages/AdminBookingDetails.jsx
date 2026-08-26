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

    useEffect(() => {
        async function fetchBooking() {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:3000/api/booking-requests/${id}`,
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
            `http://localhost:3000/api/booking-requests/${id}`,
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
            `http://localhost:3000/api/booking-requests/${id}/notes`,
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
            `http://localhost:3000/api/booking-requests/${id}/resend-confirmation`,
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
        <div>
            <h2>Booking Request Details</h2>

            <p>Confirmation: {booking.confirmation_number}</p>
            <p>Name: {booking.customer_name}</p>
            <p>Email: {booking.email}</p>
            <p>Phone: {booking.phone}</p>
            <p>Event Type: {booking.event_type}</p>
            <p>Event Date: {booking.event_date}</p>
            <p>Event Location: {booking.event_location}</p>
            <p>Guest Count: {booking.guest_count}</p>
            <p>Service: {booking.service_name}</p>
            <p>Message: {booking.message}</p>

            <h3>Admin Notes</h3>

            <textarea
                value={notes}
                placeholder="Add internal notes about this booking..."
                onChange={(event) => {
                    setNotes(event.target.value);
                }}
            />

            <button
                type="button"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                >
                {savingNotes ? "Saving..." : "Save Notes"}
            </button>

            {notesMessage && <p>{notesMessage}</p>}


            <p>Email Status: {booking.email_status}</p>

            <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resending}
            >
                {resending
                    ? "Resending..."
                    : "Resend Confirmation Email"}
            </button>

            {emailMessage && <p>{emailMessage}</p>}

            <label>
                Status:{" "}
                <select
                    value={booking.status}
                    onChange={handleStatusChange}
                    disabled={updating}
                >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="declined">Declined</option>
                </select>
            </label>

            <br />
            <Link to="/admin/dashboard">
                Return to Dashboard
            </Link>

            {updating && <p>Updating status...</p>}

            {statusMessage && <p>{statusMessage}</p>}
        </div>
    );
}

export default AdminBookingDetails;