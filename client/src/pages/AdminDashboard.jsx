import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminDashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchBookings() {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/admin/login");
            return;
        }

        try {
            const response = await fetch(
            "http://localhost:3000/api/booking-requests",
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
            throw new Error("Unable to load booking requests.");
            }

            const data = await response.json();

            setBookings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        }

        fetchBookings();
    }, [navigate]);

    if (loading) {
        return <p>Loading booking requests...</p>;
    }

    return (
        <div>
        <h2>Admin Dashboard</h2>

        <h3>Booking Requests</h3>

        {error && <p>{error}</p>}

        {bookings.length === 0 && !error && (
            <p>No booking requests found.</p>
        )}

        {bookings.map((booking) => (
            <div key={booking.id}>
            <h4>{booking.customer_name}</h4>

            <p>
                Confirmation: {booking.confirmation_number}
            </p>

            <Link to={`/admin/bookings/${booking.id}`}>
                View Details
            </Link>

            <p>Email: {booking.email}</p>

            <p>Event Type: {booking.event_type}</p>

            <p>Event Date: {booking.event_date}</p>

            <p>Guests: {booking.guest_count}</p>

            <p>Status: {booking.status}</p>

            <p>Email Status: {booking.email_status}</p>
            </div>
        ))}
        </div>
    );
}

export default AdminDashboard;