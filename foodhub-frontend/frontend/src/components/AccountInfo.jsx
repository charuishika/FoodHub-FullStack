import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import api from "../services/api.js";
import getErrorMessage from "../services/errorMessage.js";
import formatDate from "../services/formatDate.js";
import { useAuth } from "../context/AuthContext.jsx";

function AccountInfo() {
  const { timeZone } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get("/api/auth/me");
        setProfile(response.data);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
    loadProfile();
  }, []);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!profile) {
    return <CircularProgress />;
  }

  return (
    <div>
      <Typography>Name: {profile.name}</Typography>
      <Typography>Email: {profile.email}</Typography>
      <Typography>Role: {profile.role}</Typography>
      <Typography>Timezone: {profile.timeZone}</Typography>
      <Typography>
        Account created (UTC from backend): {profile.createdAt}
      </Typography>
      <Typography>
        Account created (in {timeZone}):{" "}
        {formatDate(profile.createdAt, timeZone)}
      </Typography>
    </div>
  );
}

export default AccountInfo;
