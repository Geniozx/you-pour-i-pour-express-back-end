import { useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import themePlugin from "@fullcalendar/react/themes/monarch";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/monarch/theme.css";
import "@fullcalendar/react/themes/monarch/palettes/purple.css";

function AdminCalendar() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [blackoutDates, setBlackoutDates] = useState([]);

    useEffect(() => {
        async function fetchBookings() {
            try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:3000/api/booking-requests",
                {
                headers: {
                    Authorization: `Bearer ${token}`
                }
                }
            );

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                throw new Error("Admin session expired.");
            }

            if (!response.ok) {
                throw new Error("Could not load bookings.");
            }

            const data = await response.json();

            setBookings(data);


            const blackoutResponse = await fetch(
                "http://localhost:3000/api/blackout-dates",
                {
                    headers: {
                    Authorization: `Bearer ${token}`
                    }
                }
                );

                if (!blackoutResponse.ok) {
                    throw new Error("Could not load blackout dates.");
                }

                const blackoutData = await blackoutResponse.json();

                setBlackoutDates(blackoutData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchBookings();
    }, []);


    const bookingEvents = bookings
        .filter(
            (booking) =>
                booking.status === "reserved" ||
                booking.status === "confirmed"
        )
        .map((booking) => {
            const eventDate = booking.event_date.split("T")[0];

            return {
                id: String(booking.id),
                title: `${booking.event_type} - ${booking.status}`,
                start: `${eventDate}T${booking.event_start_time}`,
                end: `${eventDate}T${booking.event_end_time}`
            };
        });


    const blackoutEvents = blackoutDates.map((blackout) => {
        const startDate = blackout.start_date.split("T")[0];
        const endDate = blackout.end_date.split("T")[0];

        const inclusiveEnd = new Date(`${endDate}T00:00:00`);
        inclusiveEnd.setDate(inclusiveEnd.getDate() + 1);

        const fullCalendarEnd = inclusiveEnd
            .toISOString()
            .split("T")[0];

        return {
            id: `blackout-${blackout.id}`,
            title: blackout.reason
            ? `Unavailable - ${blackout.reason}`
            : "Unavailable",
            start: startDate,
            end: fullCalendarEnd,
            allDay: true
        };
    });

    const calendarEvents = [
        ...bookingEvents,
        ...blackoutEvents
    ];


    async function handleEventClick(info) {
        const eventId = info.event.id;

        if (!eventId.startsWith("blackout-")) {
            return;
        }

        const blackoutId = eventId.replace("blackout-", "");

        const confirmed = window.confirm(
            "Remove this blackout date?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
            `http://localhost:3000/api/blackout-dates/${blackoutId}`,
            {
                method: "DELETE",
                headers: {
                Authorization: `Bearer ${token}`
                }
            }
            );

            if (!response.ok) {
            throw new Error("Could not remove blackout date.");
            }

            setBlackoutDates((currentDates) =>
            currentDates.filter(
                (blackout) => String(blackout.id) !== blackoutId
            )
            );
        } catch (err) {
            setError(err.message);
        }
    }


    async function handleDateSelect(selectionInfo) {
        const reason = window.prompt(
            "Reason for blackout? (Optional)"
        );

        if (reason === null) {
            return;
        }

        const startDate = selectionInfo.startStr;

        const exclusiveEnd = new Date(selectionInfo.endStr);
        exclusiveEnd.setDate(exclusiveEnd.getDate() - 1);

        const endDate = exclusiveEnd
            .toISOString()
            .split("T")[0];

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
            "http://localhost:3000/api/blackout-dates",
            {
                method: "POST",
                headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
                },
                body: JSON.stringify({
                start_date: startDate,
                end_date: endDate,
                reason
                })
            }
            );

            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(
                    errorData.err || "Could not create blackout date."
                );
            }

            const newBlackout = await response.json();

            setBlackoutDates((currentDates) => [
                ...currentDates,
                newBlackout
            ]);
        } catch (err) {
            setError(err.message);
        }
    }


    return (
        <div>
            <h2>Admin Calendar</h2>

            {loading && <p>Loading bookings...</p>}
            {error && <p>{error}</p>}


            <FullCalendar
                plugins={[
                    themePlugin,
                    dayGridPlugin,
                    timeGridPlugin,
                    interactionPlugin
                ]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay"
                }}
                events={calendarEvents}
                eventClick={handleEventClick}
                select={handleDateSelect}
                selectable={true}
            />
        </div>
    );
}

export default AdminCalendar;