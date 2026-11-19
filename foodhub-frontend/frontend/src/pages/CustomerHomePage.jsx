import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import api from "../services/api.js";
import getErrorMessage from "../services/errorMessage.js";
import FoodImage from "../components/FoodImage.jsx";

function CustomerHomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const response = await api.get("/api/restaurants");
        setRestaurants(response.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadRestaurants();
  }, []);

  // Search by restaurant name or location
  const text = search.trim().toLowerCase();
  const shownRestaurants = restaurants.filter((restaurant) =>
    `${restaurant.name} ${restaurant.location || ""}`
      .toLowerCase()
      .includes(text),
  );

  return (
    <Container className="page">
      <Box className="hero" sx={{ backgroundColor: "primary.main" }}>
        <Typography variant="h4">
          Hungry? Order from your favourite restaurants
        </Typography>
        <Typography sx={{ marginTop: 1 }}>
          Pick a restaurant, choose your food and place your order.
        </Typography>
        <TextField
          size="small"
          placeholder="Search by restaurant name or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="hero-search"
        />
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && restaurants.length === 0 && (
        <Typography>No restaurants are available yet.</Typography>
      )}
      {!loading && restaurants.length > 0 && (
        <Typography variant="h6">
          {shownRestaurants.length} restaurant
          {shownRestaurants.length === 1 ? "" : "s"}
        </Typography>
      )}
      {!loading && restaurants.length > 0 && shownRestaurants.length === 0 && (
        <Typography>No restaurant matches your search.</Typography>
      )}

      <div className="card-grid">
        {shownRestaurants.map((restaurant) => (
          <Card key={restaurant.id} className="restaurant-card">
            <FoodImage
              src={restaurant.imageUrl}
              label={restaurant.name}
              ratio="16 / 10"
            />
            <CardContent>
              <Typography variant="h6">{restaurant.name}</Typography>
              <Chip
                label={restaurant.location || "Location not given"}
                size="small"
                className="location-chip"
              />
              <Typography
                variant="body2"
                color="text.secondary"
                className="clamp-2"
              >
                {restaurant.description || "No description"}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="contained"
                component={Link}
                to={`/customer/restaurants/${restaurant.id}`}
              >
                Food Menu
              </Button>
            </CardActions>
          </Card>
        ))}
      </div>
    </Container>
  );
}

export default CustomerHomePage;
