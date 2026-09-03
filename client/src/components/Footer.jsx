import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <p>© 2026 You Party - I Pour</p>

      <Link to="/admin/login" className="admin-link">
        Admin
      </Link>
    </footer>
  );
}

export default Footer;