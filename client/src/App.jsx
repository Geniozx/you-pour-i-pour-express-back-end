import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";
import ServiceDetails from "./pages/ServiceDetails.jsx";
import Gallery from "./pages/Gallery.jsx";
import About from "./pages/About.jsx";
import RequestQuote from "./pages/RequestQuote.jsx";
import Confirmation from "./pages/Confirmation.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
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
    <div className="app">
      <Navbar
        isAdminLoggedIn={isAdminLoggedIn}
        handleLogout={handleLogout}
      />

      <main className="main-content">
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

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/bookings/:id"
            element={<AdminBookingDetails />}
          />

          <Route
            path="/admin/add-admin"
            element={<AddAdmin />}
          />

          <Route
            path="/admin/calendar"
            element={<AdminCalendar />}
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;