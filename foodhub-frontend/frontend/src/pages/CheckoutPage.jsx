import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import FoodImage from "../components/FoodImage.jsx";
import api from "../services/api.js";
import getErrorMessage from "../services/errorMessage.js";
import formatPrice from "../services/formatPrice.js";
import {
  clearCart,
  selectTotalQuantity,
  selectTotalPrice,
} from "../redux/cartSlice.js";

// One Idempotency-Key per cart content.
// Same cart -> same key (so a retry after a timeout cannot create a second order).
// Changed cart -> new key.
// The key is kept in sessionStorage so it survives going back and forth or a page refresh.
function getKeyForCart(cart) {
  const fingerprint = JSON.stringify([
    cart.restaurantId,
    cart.items.map((item) => [item.itemId, item.quantity]),
  ]);

  try {
    const saved = JSON.parse(sessionStorage.getItem("checkoutKey"));
    if (saved && saved.fingerprint === fingerprint) {
      return saved.key;
    }
  } catch (error) {
    // saved value was broken: ignore it and make a new key
  }

  const key = crypto.randomUUID();
  sessionStorage.setItem(
    "checkoutKey",
    JSON.stringify({ fingerprint: fingerprint, key: key }),
  );
  return key;
}

function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const totalQuantity = useSelector(selectTotalQuantity);
  const totalPrice = useSelector(selectTotalPrice);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // The key is created once when this page opens (not for an empty cart)
  const [idempotencyKey] = useState(() =>
    cart.items.length > 0 ? getKeyForCart(cart) : null,
  );

  // A ref changes immediately, a state value does not. This blocks a fast double click.
  const submittingRef = useRef(false);

  async function handlePlaceOrder() {
    if (submittingRef.current) {
      return;
    }
    submittingRef.current = true;
    setLoading(true);
    setError("");

    // Only item ids and quantities are sent. The backend finds the real prices itself.
    const body = {
      restaurantId: cart.restaurantId,
      items: cart.items.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
      })),
    };

    try {
      await api.post("/api/orders", body, {
        headers: { "Idempotency-Key": idempotencyKey },
      });
      sessionStorage.removeItem("checkoutKey");
      dispatch(clearCart());
      navigate("/customer/orders?placed=1");
    } catch (err) {
      setError(getErrorMessage(err));
      submittingRef.current = false;
      setLoading(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <Container className="page">
        <Typography variant="h5">Checkout</Typography>
        <Alert severity="warning" className="status-box">
          Your cart is empty. Add some food before checking out.
        </Alert>
        <Button variant="contained" component={Link} to="/customer">
          Browse restaurants
        </Button>
      </Container>
    );
  }

  return (
    <Container className="page">
      <Typography variant="h5">Checkout</Typography>
      <Typography color="text.secondary">
        Review your order from {cart.restaurantName}
      </Typography>

      {error && (
        <Alert severity="error" className="status-box">
          {error}
        </Alert>
      )}

      <div className="cart-layout">
        <div>
          {cart.items.map((item) => (
            <Card key={item.itemId} className="cart-row">
              <FoodImage
                src={item.imageUrl}
                label={item.name}
                height={64}
                width={64}
              />
              <div className="cart-info">
                <Typography variant="subtitle1">{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.quantity} x {formatPrice(item.price)}
                </Typography>
              </div>
              <Typography className="cart-line-total">
                {formatPrice(item.price * item.quantity)}
              </Typography>
            </Card>
          ))}
        </div>

        <Card className="summary-card">
          <Typography variant="h6">Payment Summary</Typography>
          <div className="summary-line">
            <span>Total quantity</span>
            <span>{totalQuantity}</span>
          </div>
          <div className="summary-total">
            <span>Estimated total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ marginTop: 1 }}
          >
            This is only an estimate. The server calculates the final amount
            from the current menu prices.
          </Typography>
          <div className="summary-buttons">
            <Button
              variant="contained"
              size="large"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Placing order..." : "Place Order"}
            </Button>
            <Button component={Link} to="/customer/cart" disabled={loading}>
              Back to cart
            </Button>
          </div>
        </Card>
      </div>
    </Container>
  );
}

export default CheckoutPage;
