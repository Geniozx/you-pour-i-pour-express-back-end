import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(
        "/auth/sign-in",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: username.trim(),
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.err || "Unable to sign in.");
      }

      localStorage.setItem("token", data.token);

      onLogin();

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Admin login error:", err);

      setError(
        err.message === "Invalid credentials."
          ? "Invalid username or password."
          : "We were unable to sign you in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <section className="admin-login-header">
        <p className="admin-eyebrow">
          Administration
        </p>

        <h2 className="admin-login-title">
          Admin Sign In
        </h2>

        <p className="admin-login-description">
          Sign in to manage bookings, gallery media, and availability.
        </p>
      </section>

      <section className="admin-login-panel">
        <form
          className="admin-login-form"
          onSubmit={handleSubmit}
        >
          <div className="admin-login-field">
            <label htmlFor="admin-login-username">
              Username
            </label>

            <input
              id="admin-login-username"
              type="text"
              value={username}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              onChange={(event) => {
                setUsername(event.target.value);
              }}
              required
            />
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-login-password">
              Password
            </label>

            <input
              id="admin-login-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              required
            />
          </div>

          <div className="admin-login-form-footer">
            <button
              className="admin-login-button"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Signing In..."
                : "Sign In →"}
            </button>
          </div>
        </form>

        {error && (
          <p className="admin-login-error">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}

export default AdminLogin;