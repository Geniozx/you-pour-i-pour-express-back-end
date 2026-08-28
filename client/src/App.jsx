import { useState } from "react";
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import "./App.css";

import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import ServiceDetails from './pages/ServiceDetails.jsx';
import Gallery from './pages/Gallery.jsx';
import About from './pages/About.jsx';
import RequestQuote from './pages/RequestQuote.jsx';
import Confirmation from './pages/Confirmation.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminBookingDetails from "./pages/AdminBookingDetails.jsx";
import AddAdmin from "./pages/AddAdmin.jsx";
import AdminCalendar from "./pages/AdminCalendar";


function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    setIsAdminLoggedIn(false);
    navigate("/admin/login");
  }


  return (
    <div>
      <h1>You Party - I Pour</h1>

      <nav>
        <Link to="/">Home</Link>{' '}
        <Link to="/services">Services</Link>{' '}
        <Link to="/gallery">Gallery</Link>{' '}
        <Link to="/about">About</Link>{' '}
        <Link to="/request-quote">Request Quote</Link>

        {isAdminLoggedIn && (
          <>
            {' '}
            <Link to="/admin/dashboard">
              Admin Dashboard
            </Link>{' '}

            <Link to="/admin/add-admin">
              Add Admin
            </Link>

            <Link to="/admin/calendar">
              Calendar 
            </Link>

            <button onClick={handleLogout}>
              Log Out
            </button>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
        <Route path="/request-quote" element={<RequestQuote />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route
          path="/admin/login"
          element={
            <AdminLogin
              onLogin={() => setIsAdminLoggedIn(true)}
            />
          }
        />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/bookings/:id" element={<AdminBookingDetails />} />
        <Route path="/admin/add-admin" element={<AddAdmin />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
      </Routes>

      <footer>
        <p>© 2026 You Party - I Pour</p>
        <Link to="/admin/login">Admin</Link>
      </footer>
    </div>
  );
}

export default App;