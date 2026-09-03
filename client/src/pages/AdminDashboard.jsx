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
        async function fetchBookings() {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/admin/login");
            return;
        }

        try {
            const response = await fetch(
            "/api/booking-requests",
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
        <div className="admin-dashboard-page">
            <section className="admin-dashboard-header">
            <p className="admin-eyebrow">
                Administration
            </p>

            <h2 className="admin-dashboard-title">
                Dashboard
            </h2>
            </section>

            <section className="admin-overview">
            <div className="admin-overview-item">
                <span>Total Requests</span>
                <strong>{bookings.length}</strong>
            </div>

            <div className="admin-overview-item">
                <span>New</span>
                <strong>{newCount}</strong>
            </div>

            <div className="admin-overview-item">
                <span>Contacted</span>
                <strong>{contactedCount}</strong>
            </div>

            <div className="admin-overview-item">
                <span>Confirmed</span>
                <strong>{confirmedCount}</strong>
            </div>

            <div className="admin-overview-item">
                <span>Declined</span>
                <strong>{declinedCount}</strong>
            </div>

            <div className="admin-overview-item">
                <span>Failed Emails</span>
                <strong>{failedEmailCount}</strong>
            </div>
            </section>

            <section className="admin-bookings-section">
            <div className="admin-section-header">
                <h3>Booking Requests</h3>
            </div>

            {error && (
                <p className="admin-status-message admin-error">
                {error}
                </p>
            )}

            {bookings.length === 0 && !error && (
                <p className="admin-status-message">
                No booking requests found.
                </p>
            )}

            <div className="admin-filters">
                <input
                className="admin-search-input"
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
                <p className="admin-status-message">
                No matching booking requests.
                </p>
            )}

            <div className="admin-booking-list">
                {filteredBookings.map((booking) => (
                <article
                    key={booking.id}
                    className="admin-booking-item"
                >
                    <div className="admin-booking-heading">
                    <div>
                        <h4>{booking.customer_name}</h4>

                        <p>
                        Confirmation: {booking.confirmation_number}
                        </p>
                    </div>

                    <Link
                        className="admin-booking-link"
                        to={`/admin/bookings/${booking.id}`}
                    >
                        View Details →
                    </Link>
                    </div>

                    <div className="admin-booking-details">
                    <p>
                        <span>Email</span>
                        {booking.email}
                    </p>

                    <p>
                        <span>Event Type</span>
                        {booking.event_type}
                    </p>

                    <p>
                        <span>Event Date</span>
                        {formatDate(booking.event_date)}
                    </p>

                    <p>
                        <span>Time</span>
                        {formatTime(booking.event_start_time)} -{" "}
                        {formatTime(booking.event_end_time)}
                    </p>

                    <p>
                        <span>Guests</span>
                        {booking.guest_count}
                    </p>

                    <p>
                        <span>Service</span>
                        {booking.service_name}
                    </p>

                    <p>
                        <span>Status</span>
                        {booking.status}
                    </p>

                    <p>
                        <span>Email Status</span>
                        {booking.email_status}
                    </p>
                    </div>
                </article>
                ))}
            </div>
            </section>
        </div>
        );
}

export default AdminDashboard;