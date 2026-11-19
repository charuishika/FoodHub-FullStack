import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
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
import { useAuth } from "../context/AuthContext.jsx";

function MyOrdersPage() {
  const { timeZone } = useAuth();
  const [searchParams] = useSearchParams();
  const justPlaced = searchParams.get("placed") === "1";

  const [orders, setOrders] = useState([]);
  const [restaurantNames, setRestaurantNames] = useState({}); // { 1: "Spice Garden", ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const ordersResponse = await api.get("/api/orders/my");
      setOrders(ordersResponse.data);

      // An order only has restaurantId, so we get the names from the restaurant list.
      // If this fails we simply show the restaurant number instead.
      try {
        const restaurantsResponse = await api.get("/api/restaurants");
        const names = {};
        restaurantsResponse.data.forEach((restaurant) => {
          names[restaurant.id] = restaurant.name;
        });
        setRestaurantNames(names);
      } catch (nameError) {
        setRestaurantNames({});
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <Container className="page">
      <div className="top-row">
        <Typography variant="h5">My Orders</Typography>
        <Button variant="outlined" onClick={loadOrders} disabled={loading}>
          Refresh status
        </Button>
      </div>

      {justPlaced && (
        <Alert severity="success" className="status-box">
          Your order was placed successfully.
        </Alert>
      )}
      {error && (
        <Alert severity="error" className="status-box">
          {error}
        </Alert>
      )}
      {loading && <CircularProgress className="status-box" />}

      {!loading && !error && orders.length === 0 && (
        <Typography className="status-box">
          You have not placed any orders yet.
        </Typography>
      )}

      {!loading && orders.length > 0 && (
        <TableContainer component={Paper} className="status-box">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Restaurant</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date ({timeZone})</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell>
                    {restaurantNames[order.restaurantId] ||
                      `Restaurant #${order.restaurantId}`}
                  </TableCell>
                  <TableCell>
                    {order.items.map((item) => (
                      <div key={item.itemId}>
                        {item.quantity} x {item.itemName}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                  <TableCell>{formatDate(order.createdAt, timeZone)}</TableCell>
                  <TableCell>
                    <StatusChip status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default MyOrdersPage;
