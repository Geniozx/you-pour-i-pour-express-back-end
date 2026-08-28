import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminDashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [emailFilter, setEmailFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

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

    const filteredBookings = bookings
        .filter((booking) => {
            const searchValue = search.toLowerCase();

            const matchesSearch =
            (booking.customer_name || "")
                .toLowerCase()
                .includes(searchValue) ||
            (booking.email || "")
                .toLowerCase()
                .includes(searchValue) ||
            (booking.confirmation_number || "")
                .toLowerCase()
                .includes(searchValue);

            const matchesStatus =
            statusFilter === "all" ||
            booking.status === statusFilter;

            const matchesEmail =
            emailFilter === "all" ||
            booking.email_status === emailFilter;

            return (
            matchesSearch &&
            matchesStatus &&
            matchesEmail
            );
        })
        .sort((a, b) => {
            if (sortBy === "event-date") {
            return new Date(a.event_date) - new Date(b.event_date);
            }

            return b.id - a.id;
        });


        const newCount = bookings.filter(
            (booking) => booking.status === "new"
        ).length;

        const contactedCount = bookings.filter(
            (booking) => booking.status === "contacted"
        ).length;

        const confirmedCount = bookings.filter(
            (booking) => booking.status === "confirmed"
        ).length;

        const declinedCount = bookings.filter(
            (booking) => booking.status === "declined"
        ).length;

        const failedEmailCount = bookings.filter(
            (booking) => booking.email_status === "failed"
        ).length;

    return (
        <div>
        <h2>Admin Dashboard</h2>

        <div>
            <h3>Overview</h3>

            <p>Total Requests: {bookings.length}</p>
            <p>New: {newCount}</p>
            <p>Contacted: {contactedCount}</p>
            <p>Confirmed: {confirmedCount}</p>
            <p>Declined: {declinedCount}</p>
            <p>Failed Emails: {failedEmailCount}</p>
        </div>

        <h3>Booking Requests</h3>

        {error && <p>{error}</p>}

        {bookings.length === 0 && !error && (
            <p>No booking requests found.</p>
        )}

        <div>
            <input
                type="text"
                value={search}
                placeholder="Search name, email, or confirmation number"
                onChange={(event) => {
                setSearch(event.target.value);
                }}
            />

            <select
                value={statusFilter}
                onChange={(event) => {
                setStatusFilter(event.target.value);
                }}
            >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="confirmed">Confirmed</option>
                <option value="reserved">Reserved</option>
                <option value="declined">Declined</option>
            </select>

            <select
                value={emailFilter}
                onChange={(event) => {
                setEmailFilter(event.target.value);
                }}
            >
                <option value="all">All Email Statuses</option>
                <option value="sent">Email Sent</option>
                <option value="failed">Email Failed</option>
                <option value="pending">Email Pending</option>
            </select>

            <select
                value={sortBy}
                onChange={(event) => {
                setSortBy(event.target.value);
                }}
            >
                <option value="newest">Newest Requests</option>
                <option value="event-date">Upcoming Event Date</option>
            </select>
        </div>


        {filteredBookings.length === 0 && (
            <p>No matching booking requests.</p>
        )}

        {filteredBookings.map((booking) => (
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

                <p>Time: {booking.event_start_time} - {booking.event_end_time}</p>

                <p>Guests: {booking.guest_count}</p>

                <p>Service: {booking.service_name}</p>

                <p>Status: {booking.status}</p>

                <p>Email Status: {booking.email_status}</p>
            </div>
        ))}
        </div>
    );
}

export default AdminDashboard;