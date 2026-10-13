import { useState } from "react";
import { Link, useAsyncValue, useNavigate } from "react-router-dom";
import api
    from "../../services/api";

function Login() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", form);

            const { access_token, token_type } = response.data;

            if (!access_token) {
                throw new Error("Access token was not returned by the server.");
            }

            localStorage.setItem("access_token", access_token);
            localStorage.setItem("toekn_type", token_type || "bearer");

            navigate("/dashboard", { replace: true });

        } catch (err) {

            setError(
                err.response?.data?.detail ||
                err.message ||
                "Login failed. Please try again"
            );

        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="auth-container">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Login</h1>

                {error & <div className="errorMessage"> {error}</div>}

                <label htmlFor="email" >Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                />

                <label htmlFor="Password" >Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="password"
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Signin in..." : "sign In"}
                </button>

                <p>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>


            </form>
        </div>
    );





}

export default Login;