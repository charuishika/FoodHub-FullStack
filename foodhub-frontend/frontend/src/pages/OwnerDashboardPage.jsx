import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import api from "../services/api.js";
import getErrorMessage from "../services/errorMessage.js";
import formatPrice from "../services/formatPrice.js";
import formatDate from "../services/formatDate.js";
import StatusChip from "../components/StatusChip.jsx";
import NoRestaurantNotice from "../components/NoRestaurantNotice.jsx";
import FoodImage from "../components/FoodImage.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// A small number card with a colored left edge
function StatCard({ label, value, color }) {
  return (
    <Card sx={{ borderLeft: "6px solid", borderColor: color }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
}

function OwnerDashboardPage() {
  const { user, timeZone } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [noRestaurant, setNoRestaurant] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const restaurantResponse = await api.get("/api/restaurants/my");
        setRestaurant(restaurantResponse.data);

        const menuResponse = await api.get(
          `/api/restaurants/${restaurantResponse.data.id}/menu`,
        );
        setMenuItems(menuResponse.data.items);

        const ordersResponse = await api.get("/api/orders/restaurant", {
          params: { page: 0, size: 5, sort: "createdAt,desc" },
        });
        setRecentOrders(ordersResponse.data.content);
        setTotalOrders(ordersResponse.data.totalElements);
      } catch (err) {
        if (err.response && err.response.status === 404 && !restaurant) {
          setNoRestaurant(true);
        } else {
          setError(getErrorMessage(err));
        }
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const availableCount = menuItems.filter((item) => item.available).length;
  const newOrders = recentOrders.filter(
    (order) => order.status === "PLACED",
  ).length;

  if (loading) {
    return (
      <Container className="page">
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container className="page">
      <Typography variant="h5">Welcome, {user.name}</Typography>
      <Typography variant="body2" color="text.secondary">
        Here is how your restaurant is doing.
      </Typography>

      {error && (
        <Alert severity="error" className="status-box">
          {error}
        </Alert>
      )}
      {noRestaurant && <NoRestaurantNotice />}

      {restaurant && (
        <>
          <Card className="owner-restaurant-card">
            <div className="restaurant-header">
              <FoodImage
                src={restaurant.imageUrl}
                label={restaurant.name}
                ratio="4 / 3"
              />
              <div className="restaurant-header-info">
                <Typography variant="h5">{restaurant.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {restaurant.location || "Location not given"}
                </Typography>
                <Typography variant="body2">
                  {restaurant.description || "No description"}
                </Typography>
                <div className="button-row status-box">
                  <Button variant="contained" component={Link} to="/owner/menu">
                    Manage menu
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    component={Link}
                    to="/owner/orders"
                  >
                    View orders
                  </Button>
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/owner/restaurant"
                  >
                    Restaurant details
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="stat-grid">
            <StatCard
              label="Menu items"
              value={menuItems.length}
              color="primary.main"
            />
            <StatCard
              label="Available now"
              value={availableCount}
              color="success.main"
            />
            <StatCard
              label="Total orders"
              value={totalOrders}
              color="secondary.main"
            />
            <StatCard
              label="New in latest 5"
              value={newOrders}
              color="info.main"
            />
          </div>

          <Paper className="dashboard-box">
            <Typography variant="h6">Recent Orders</Typography>

            {recentOrders.length === 0 && (
              <Typography variant="body2">No orders yet.</Typography>
            )}

            {recentOrders.length > 0 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Items</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date ({timeZone})</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.orderId}>
                        <TableCell>
                          {order.items.map((item) => (
                            <div key={item.itemId}>
                              {item.quantity} x {item.itemName}
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                        <TableCell>
                          {formatDate(order.createdAt, timeZone)}
                        </TableCell>
                        <TableCell>
                          <StatusChip status={order.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Button component={Link} to="/owner/orders" size="small">
              View all orders
            </Button>
          </Paper>
        </>
      )}
    </Container>
  );
}

export default OwnerDashboardPage;
