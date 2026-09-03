import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar({ isAdminLoggedIn, handleLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function logout() {
    closeMenu();
    handleLogout();
  }

  return (
    <>
        <header className="site-header">
            <button
                className="menu-toggle"
                onClick={toggleMenu}
                aria-label="Open navigation menu"
                >

                <img
                    className="glass-logo"
                    src="/Glossy Amber Whiskey Tumbler.png"
                    alt=""
                    aria-hidden="true"
                />

                <span className="brand-name">
                    You Party - I Pour
                </span>
            </button>
        </header>

      <nav className={`side-nav ${menuOpen ? "open" : ""}`}>
        <button
          className="nav-close"
          onClick={closeMenu}
          aria-label="Close navigation menu"
        >
          ×
        </button>

        <div className="nav-links">
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>

          <Link to="/services" onClick={closeMenu}>
            Services
          </Link>

          <Link to="/gallery" onClick={closeMenu}>
            Gallery
          </Link>

          <Link to="/about" onClick={closeMenu}>
            About
          </Link>

          <Link to="/request-quote" onClick={closeMenu}>
            Request Quote
          </Link>
        </div>

        {isAdminLoggedIn && (
          <div className="admin-nav">
            <Link
              to="/admin/dashboard"
              onClick={closeMenu}
            >
              Admin Dashboard
            </Link>

            <Link
              to="/admin/add-admin"
              onClick={closeMenu}
            >
              Add Admin
            </Link>

            <Link
              to="/admin/calendar"
              onClick={closeMenu}
            >
              Calendar
            </Link>

            <button
              className="logout-button"
              onClick={logout}
            >
              Log Out
            </button>
          </div>
        )}
      </nav>

      {menuOpen && (
        <button
          className="nav-overlay"
          onClick={closeMenu}
          aria-label="Close navigation menu"
        />
      )}
    </>
  );
}

export default Navbar;