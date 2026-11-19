import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import api from "../services/api.js";
import getErrorMessage from "../services/errorMessage.js";
import { useAuth, getHomePath } from "../context/AuthContext.jsx";

function LoginPage() {
  const { login, isLoggedIn, role } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Message passed by the register page, or set when the session expired
  const sessionExpired = searchParams.get("expired") === "1";
  const registered = searchParams.get("registered") === "1";

  // Already logged in: no need to see the login form
  if (isLoggedIn) {
    return <Navigate to={getHomePath(role)} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (email.trim() === "" || password === "") {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/auth/login", {
        email: email.trim(),
        password: password,
      });
      login(response.data.token, response.data.user);
      navigate(getHomePath(response.data.user.role));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="xs" className="page">
      <Paper className="form-box">
        <Typography variant="h5">Login</Typography>

        {registered && (
          <Alert severity="success">
            Registration successful. Please login.
          </Alert>
        )}
        {sessionExpired && (
          <Alert severity="warning">
            Your session expired. Please login again.
          </Alert>
        )}
        {error && <Alert severity="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="form-fields">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <Typography variant="body2">
          New here? <Link to="/register">Create an account</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default LoginPage;
