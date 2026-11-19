import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import api from "../services/api.js";
import getErrorMessage from "../services/errorMessage.js";
import formatPrice from "../services/formatPrice.js";
import formatDate from "../services/formatDate.js";
import StatusChip from "../components/StatusChip.jsx";
import NoRestaurantNotice from "../components/NoRestaurantNotice.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const actionsByStatus = {
  PLACED: [
    { label: "Accept", status: "ACCEPTED" },
    { label: "Reject", status: "REJECTED" },
  ],
  ACCEPTED: [{ label: "Start preparing", status: "PREPARING" }],
  PREPARING: [{ label: "Mark READY", status: "READY" }],
};

function OwnerOrdersPage() {
  const { timeZone } = useAuth();

  const [orders, setOrders] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [loading, setLoading] = useState(true);
  const [noRestaurant, setNoRestaurant] = useState(false);
  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [orderToReject, setOrderToReject] = useState(null);

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/orders/restaurant", {
        params: { page: page, size: rowsPerPage, sort: "createdAt,desc" },
      });
      setOrders(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setNoRestaurant(true);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [page, rowsPerPage]);

  async function changeStatus(order, newStatus) {
    setError("");
    setUpdatingId(order.orderId);
    try {
      const response = await api.patch(`/api/orders/${order.orderId}/status`, {
        status: newStatus,
      });
      setOrders((oldOrders) =>
        oldOrders.map((oldOrder) =>
          oldOrder.orderId === response.data.orderId ? response.data : oldOrder,
        ),
      );
    } catch (err) {
      const message = getErrorMessage(err);
      await loadOrders();
      setError(message);
    } finally {
      setUpdatingId(null);
    }
  }

  function handleActionClick(order, status) {
    if (status === "REJECTED") {
      setOrderToReject(order);
    } else {
      changeStatus(order, status);
    }
  }

  function handleConfirmReject() {
    const order = orderToReject;
    setOrderToReject(null);
    changeStatus(order, "REJECTED");
  }

  function handleRowsPerPageChange(event) {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  }

  const selectedOrder = orders.find((order) => order.orderId === selectedId);

  return (
    <Container className="page">
      <div className="top-row">
        <Typography variant="h5">Incoming Orders</Typography>
        <Button variant="outlined" onClick={loadOrders} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error && (
        <Alert severity="error" className="status-box">
          {error}
        </Alert>
      )}
      {noRestaurant && <NoRestaurantNotice />}
      {loading && <CircularProgress className="status-box" />}

      {!loading && !noRestaurant && !error && totalElements === 0 && (
        <Typography className="status-box">No orders yet.</Typography>
      )}

      {!loading && orders.length > 0 && (
        <Paper className="status-box">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date ({timeZone})</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const actions = actionsByStatus[order.status] || [];
                  return (
                    <TableRow key={order.orderId}>
                      <TableCell>Customer #{order.customerId}</TableCell>
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
                      <TableCell>
                        <div className="table-actions">
                          <Button
                            size="small"
                            onClick={() => setSelectedId(order.orderId)}
                          >
                            Details
                          </Button>
                          {actions.map((action) => (
                            <Button
                              key={action.status}
                              size="small"
                              variant="outlined"
                              color={
                                action.status === "REJECTED"
                                  ? "error"
                                  : "primary"
                              }
                              disabled={updatingId === order.orderId}
                              onClick={() =>
                                handleActionClick(order, action.status)
                              }
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </Paper>
      )}

      {/* Order details */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedId(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Order details</DialogTitle>
        {selectedOrder && (
          <DialogContent>
            <Typography>Customer: #{selectedOrder.customerId}</Typography>
            <Typography>
              Date ({timeZone}): {formatDate(selectedOrder.createdAt, timeZone)}
            </Typography>
            <Typography component="div">
              Status: <StatusChip status={selectedOrder.status} />
            </Typography>

            <Table size="small" className="status-box">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedOrder.items.map((item) => (
                  <TableRow key={item.itemId}>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{formatPrice(item.price)}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatPrice(item.lineTotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Typography variant="h6">
              Total: {formatPrice(selectedOrder.totalAmount)}
            </Typography>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setSelectedId(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Reject confirmation */}
      <Dialog
        open={orderToReject !== null}
        onClose={() => setOrderToReject(null)}
      >
        <DialogTitle>Reject this order?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A rejected order cannot be accepted again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderToReject(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmReject}
          >
            Reject order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default OwnerOrdersPage;
