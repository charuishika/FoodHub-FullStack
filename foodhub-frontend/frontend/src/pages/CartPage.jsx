import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FoodImage from "../components/FoodImage.jsx";
import formatPrice from "../services/formatPrice.js";
import {
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  clearCart,
  selectTotalQuantity,
  selectTotalPrice,
} from "../redux/cartSlice.js";

function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const totalQuantity = useSelector(selectTotalQuantity);
  const totalPrice = useSelector(selectTotalPrice);

  if (cart.items.length === 0) {
    return (
      <Container className="page">
        <Typography variant="h5">Your Cart</Typography>
        <Typography className="status-box">Your cart is empty.</Typography>
        <Button variant="contained" component={Link} to="/customer">
          Browse restaurants
        </Button>
      </Container>
    );
  }

  return (
    <Container className="page">
      <Typography variant="h5">Your Cart</Typography>
      <Typography color="text.secondary">From {cart.restaurantName}</Typography>

      <div className="cart-layout">
        <div>
          {cart.items.map((item) => (
            <Card key={item.itemId} className="cart-row">
              <FoodImage
                src={item.imageUrl}
                label={item.name}
                height={80}
                width={80}
              />

              <div className="cart-info">
                <Typography variant="subtitle1">{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatPrice(item.price)} each
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => dispatch(removeItem(item.itemId))}
                >
                  Remove
                </Button>
              </div>

              <div className="quantity-box">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => dispatch(decreaseQuantity(item.itemId))}
                >
                  -
                </Button>
                <span>{item.quantity}</span>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={item.quantity >= 50}
                  onClick={() => dispatch(increaseQuantity(item.itemId))}
                >
                  +
                </Button>
              </div>

              <Typography className="cart-line-total">
                {formatPrice(item.price * item.quantity)}
              </Typography>
            </Card>
          ))}

          <div className="button-row">
            <Button
              component={Link}
              to={`/customer/restaurants/${cart.restaurantId}`}
            >
              Add more items
            </Button>
            <Button color="error" onClick={() => dispatch(clearCart())}>
              Clear cart
            </Button>
          </div>
        </div>

        <Card className="summary-card">
          <Typography variant="h6">Order Summary</Typography>
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
            The final amount is calculated by the server when you place the
            order.
          </Typography>
          <div className="summary-buttons">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/customer/checkout")}
            >
              Go to checkout
            </Button>
          </div>
        </Card>
      </div>
    </Container>
  );
}

export default CartPage;
