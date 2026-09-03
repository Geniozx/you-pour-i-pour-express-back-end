import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddAdmin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/admins",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            username: username.trim(),
            password
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
          data.err || "Unable to create admin."
        );
      }

      setMessage(
        `Admin ${data.username} created successfully.`
      );

      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="add-admin-page">
      <section className="add-admin-header">
        <p className="admin-eyebrow">
          Administration
        </p>

        <h2 className="add-admin-title">
          Add Admin
        </h2>

        <p className="add-admin-description">
          Create a new administrator account.
        </p>
      </section>

      <section className="add-admin-panel">
        <form
          className="add-admin-form"
          onSubmit={handleSubmit}
        >
          <div className="add-admin-field">
            <label htmlFor="add-admin-username">
              Username
            </label>

            <input
              id="add-admin-username"
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

          <div className="add-admin-field">
            <label htmlFor="add-admin-password">
              Password
            </label>

            <input
              id="add-admin-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              required
            />
          </div>

          <div className="add-admin-field">
            <label htmlFor="add-admin-confirm-password">
              Confirm Password
            </label>

            <input
              id="add-admin-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
              }}
              required
            />
          </div>

          <div className="add-admin-form-footer">
            <button
              className="add-admin-button"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Creating..."
                : "Create Admin →"}
            </button>
          </div>
        </form>

        {error && (
          <p className="add-admin-message add-admin-error">
            {error}
          </p>
        )}

        {message && (
          <p className="add-admin-message">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}

export default AddAdmin;