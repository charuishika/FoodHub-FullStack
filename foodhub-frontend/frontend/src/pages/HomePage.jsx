import { Link, Navigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useAuth, getHomePath } from "../context/AuthContext.jsx";

const steps = [
  {
    number: "1",
    title: "Choose a restaurant",
    text: "Browse restaurants and open their food menu.",
  },
  {
    number: "2",
    title: "Add food to your cart",
    text: "Pick your items and quantities, then check out.",
  },
  {
    number: "3",
    title: "Track your order",
    text: "See when the restaurant accepts, prepares and finishes it.",
  },
];

const customerPoints = [
  "Browse restaurants and menus",
  "Order in a few clicks",
  "Track every order status",
];

const ownerPoints = [
  "Create your restaurant page",
  "Add and edit your food menu",
  "Accept and manage incoming orders",
];

function HomePage() {
  const { isLoggedIn, role } = useAuth();

  // Logged-in users go straight to their own page
  if (isLoggedIn) {
    return <Navigate to={getHomePath(role)} replace />;
  }

  return (
    <div>
      {/* Hero */}
      <Box className="welcome-hero" sx={{ backgroundColor: "primary.main" }}>
        <Container maxWidth="md">
          <Typography variant="h3" className="welcome-title">
            Good food, delivered to your order list
          </Typography>
          <Typography variant="h6" className="welcome-subtitle">
            Order from your favourite restaurants, or run your own restaurant on
            FoodHub.
          </Typography>
          <div className="welcome-buttons">
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/register"
              className="welcome-main-button"
            >
              Get started
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/login"
              className="welcome-outline-button"
            >
              Login
            </Button>
          </div>
        </Container>
      </Box>

      {/* How it works */}
      <Container className="page">
        <Typography variant="h5" align="center">
          How it works
        </Typography>
        <div className="steps-grid">
          {steps.map((step) => (
            <Card key={step.number}>
              <CardContent className="step-card">
                <Box
                  className="step-number"
                  sx={{ backgroundColor: "primary.main" }}
                >
                  {step.number}
                </Box>
                <Typography variant="h6">{step.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.text}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Two kinds of users */}
        <div className="role-grid">
          <Card>
            <CardContent>
              <Typography variant="h6">For customers</Typography>
              <ul className="point-list">
                {customerPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Button variant="contained" component={Link} to="/register">
                Register as customer
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6">For restaurant owners</Typography>
              <ul className="point-list">
                {ownerPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Button variant="outlined" component={Link} to="/register">
                Register as owner
              </Button>
            </CardContent>
          </Card>
        </div>

        <Typography align="center" className="status-box">
          Already have an account? <Link to="/login">Login here</Link>
        </Typography>
      </Container>
    </div>
  );
}

export default HomePage;
