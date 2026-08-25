import { useState } from "react";
import { useNavigate } from "react-router-dom";


function AdminLogin() {
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
            "http://localhost:3000/auth/sign-in",
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify({
                username,
                password
                })
            }
            );

            const data = await response.json();

            if (!response.ok) {
            throw new Error(data.err);
            }

            localStorage.setItem("token", data.token);

            navigate("/admin/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
        }

    return (
        <div>
            <h2>Admin Sign In</h2>

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

            <button
                type="submit"
                disabled={submitting}
            >
                {submitting ? "Signing In..." : "Sign In"}
            </button>

            {error && <p>{error}</p>}
            </form>
        </div>
    );
}

export default AdminLogin;