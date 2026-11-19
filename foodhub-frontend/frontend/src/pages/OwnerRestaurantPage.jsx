import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import api from "../services/api.js";
import getErrorMessage from "../services/errorMessage.js";
import formatDate from "../services/formatDate.js";
import { useAuth } from "../context/AuthContext.jsx";
import FoodImage from "../components/FoodImage.jsx";
import checkImageUrl from "../services/validateImageUrl.js";

function OwnerRestaurantPage() {
  const { timeZone } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Blocks a second submit immediately (a state value updates too late for a fast double click)
  const submittingRef = useRef(false);

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const response = await api.get("/api/restaurants/my");
        setRestaurant(response.data);
      } catch (err) {
        // 404 only means "no restaurant yet", so the create form is shown
        if (!(err.response && err.response.status === 404)) {
          setError(getErrorMessage(err));
        }
      } finally {
        setLoading(false);
      }
    }
    loadRestaurant();
  }, []);

  function validate() {
    if (name.trim() === "") return "Restaurant name is required.";
    if (name.trim().length > 100) return "Name must be at most 100 characters.";
    if (description.length > 500)
      return "Description must be at most 500 characters.";
    if (location.length > 200)
      return "Location must be at most 200 characters.";
    const imageProblem = checkImageUrl(imageUrl);
    if (imageProblem) return imageProblem;
    return "";
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (submittingRef.current) {
      return;
    }
    setError("");

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    submittingRef.current = true;
    setSaving(true);
    try {
      const response = await api.post("/api/restaurants", {
        name: name.trim(),
        description: description.trim(),
        location: location.trim(),
        imageUrl: imageUrl.trim(),
      });
      setRestaurant(response.data);
    } catch (err) {
      // 409 (already exists), timeout or connection problem: the restaurant may have been created anyway.
      // Ask the backend. If it exists, just show it instead of an error.
      const status = err.response ? err.response.status : null;
      if (
        status === 409 ||
        status === 503 ||
        status === 504 ||
        status === null
      ) {
        try {
          const existing = await api.get("/api/restaurants/my");
          setRestaurant(existing.data);
          return;
        } catch (checkError) {
          // really not created: fall through and show the error
        }
      }
      setError(getErrorMessage(err));
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Container className="page">
        <CircularProgress />
      </Container>
    );
  }

  // Owner already has a restaurant: show the details
  if (restaurant) {
    return (
      <Container maxWidth="sm" className="page">
        <Paper className="form-box">
          <FoodImage
            src={restaurant.imageUrl}
            label={restaurant.name}
            ratio="16 / 10"
          />
          <Typography variant="h5">My Restaurant</Typography>
          <Typography>Name: {restaurant.name}</Typography>
          <Typography>
            Description: {restaurant.description || "No description"}
          </Typography>
          <Typography>
            Location: {restaurant.location || "Not given"}
          </Typography>
          <Typography>
            Created: {formatDate(restaurant.createdAt, timeZone)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Editing the restaurant is not supported yet. Each owner can have
            only one restaurant.
          </Typography>
          <div className="button-row">
            <Button variant="contained" component={Link} to="/owner/menu">
              Manage menu
            </Button>
            <Button component={Link} to="/owner">
              Back to dashboard
            </Button>
          </div>
        </Paper>
      </Container>
    );
  }

  // No restaurant yet: show the create form
  return (
    <Container maxWidth="sm" className="page">
      <Paper className="form-box">
        <Typography variant="h5">Create Your Restaurant</Typography>
        <Typography variant="body2">
          You can create only one restaurant.
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <form onSubmit={handleCreate} className="form-fields">
          <TextField
            label="Restaurant name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
          <TextField
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
          />
          <TextField
            label="Restaurant image link (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            helperText="Paste a direct image link starting with https://"
            fullWidth
          />
          {imageUrl.trim() !== "" && (
            <div className="preview-box">
              <FoodImage
                key={imageUrl}
                src={imageUrl.trim()}
                label={name || "Restaurant"}
                height={140}
              />
            </div>
          )}
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Creating..." : "Create restaurant"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default OwnerRestaurantPage;
