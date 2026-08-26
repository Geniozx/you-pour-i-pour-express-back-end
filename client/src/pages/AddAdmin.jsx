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
        "http://localhost:3000/api/admins",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            username,
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
    <div>
      <h2>Add Admin</h2>

      <form onSubmit={handleSubmit}>
        <label>Username: </label>
        <input
          type="text"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
          }}
          required
        />

        <label>Password: </label>
        <input
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          required
        />

        <label>Confirm Password: </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
          }}
          required
        />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Admin"}
        </button>
      </form>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddAdmin;