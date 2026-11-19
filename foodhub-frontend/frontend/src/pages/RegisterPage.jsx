import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import api from "../services/api.js";
import getErrorMessage from "../services/errorMessage.js";
import { useAuth, getHomePath } from "../context/AuthContext.jsx";

// Asks the browser for the device timezone, for example "Asia/Kolkata".
// Returns "" if the browser cannot tell.
function getDeviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch (error) {
    return "";
  }
}

function RegisterPage() {
  const { isLoggedIn, role: loggedInRole } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const deviceTimeZone = getDeviceTimeZone();

  if (isLoggedIn) {
    return <Navigate to={getHomePath(loggedInRole)} replace />;
  }

  // Basic checks before calling the backend (the backend checks again)
  function validate() {
    if (name.trim() === "") return "Name is required.";
    if (!email.includes("@") || !email.includes("."))
      return "Please enter a valid email.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password.length > 72) return "Password must be at most 72 characters.";
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    const body = {
      name: name.trim(),
      email: email.trim(),
      password: password,
      role: role,
    };
    // The timezone comes from the device. If it is empty, the backend uses its own default.
    if (deviceTimeZone !== "") {
      body.timeZone = deviceTimeZone;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/register", body);
      navigate("/login?registered=1");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="xs" className="page">
      <Paper className="form-box">
        <Typography variant="h5">Register</Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="form-fields">
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Password (minimum 8 characters)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          <TextField
            select
            label="I am a"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth
          >
            <MenuItem value="CUSTOMER">Customer</MenuItem>
            <MenuItem value="OWNER">Restaurant Owner</MenuItem>
          </TextField>

          {deviceTimeZone && (
            <Typography variant="body2" color="text.secondary">
              Order times will be shown in your device timezone:{" "}
              {deviceTimeZone}
            </Typography>
          )}

          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <Typography variant="body2">
          Already have an account? <Link to="/login">Login</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default RegisterPage;
