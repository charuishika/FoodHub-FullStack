import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import api from "../services/api.js";
import getErrorMessage from "../services/errorMessage.js";
import formatPrice from "../services/formatPrice.js";
import FoodImage from "../components/FoodImage.jsx";
import {
  addItem,
  replaceCart,
  selectTotalQuantity,
  selectTotalPrice,
} from "../redux/cartSlice.js";

function MenuPage() {
  const { id } = useParams(); // restaurant id from the URL
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const totalQuantity = useSelector(selectTotalQuantity);
  const totalPrice = useSelector(selectTotalPrice);

  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingItem, setPendingItem] = useState(null); // item waiting for the user's confirmation

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const restaurantResponse = await api.get(`/api/restaurants/${id}`);
        const menuResponse = await api.get(`/api/restaurants/${id}/menu`);
        setRestaurant(restaurantResponse.data);
        setItems(menuResponse.data.items);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  function handleAdd(item) {
    const cartHasOtherRestaurant =
      cart.items.length > 0 && cart.restaurantId !== restaurant.id;

    if (cartHasOtherRestaurant) {
      setPendingItem(item); // opens the confirmation dialog
      return;
    }

    dispatch(
      addItem({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        item: item,
      }),
    );
  }

  function handleReplaceCart() {
    dispatch(
      replaceCart({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        item: pendingItem,
      }),
    );
    setPendingItem(null);
  }

  // How many of this item are in the cart (only counts if the cart is for this restaurant)
  function quantityInCart(itemId) {
    if (!restaurant || cart.restaurantId !== restaurant.id) {
      return 0;
    }
    const found = cart.items.find((i) => i.itemId === itemId);
    return found ? found.quantity : 0;
  }

  if (loading) {
    return (
      <Container className="page">
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="page">
        <Alert severity="error">{error}</Alert>
        <Button component={Link} to="/customer" className="status-box">
          Back to restaurants
        </Button>
      </Container>
    );
  }

  const cartIsForThisRestaurant =
    cart.restaurantId === restaurant.id && totalQuantity > 0;

  return (
    <Container className="page">
      <Button component={Link} to="/customer">
        Back to restaurants
      </Button>

      <Card className="restaurant-header status-box">
        <FoodImage
          src={restaurant.imageUrl}
          label={restaurant.name}
          ratio="4 / 3"
        />
        <div className="restaurant-header-info">
          <Typography variant="h5">{restaurant.name}</Typography>
          <Chip
            label={restaurant.location || "Location not given"}
            size="small"
            sx={{ alignSelf: "flex-start" }}
          />
          <Typography variant="body2" color="text.secondary">
            {restaurant.description || "No description"}
          </Typography>
        </div>
      </Card>

      <Typography variant="h6" className="status-box">
        Food Menu ({items.length} items)
      </Typography>

      {items.length === 0 && (
        <Typography>
          This restaurant has not added any food items yet.
        </Typography>
      )}

      <div className="food-grid">
        {items.map((item) => (
          <Card
            key={item.itemId}
            className={item.available ? "food-card" : "food-card unavailable"}
          >
            <div className="image-wrap">
              <FoodImage src={item.imageUrl} label={item.name} ratio="4 / 3" />
              {!item.available && (
                <Chip
                  label="Not available"
                  color="error"
                  size="small"
                  className="image-badge"
                />
              )}
            </div>
            <CardContent>
              <Typography variant="subtitle1">{item.name}</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="clamp-2"
              >
                {item.description || "No description"}
              </Typography>
              {quantityInCart(item.itemId) > 0 && (
                <Chip
                  label={`In cart: ${quantityInCart(item.itemId)}`}
                  size="small"
                  color="primary"
                  sx={{ marginTop: 1 }}
                />
              )}
            </CardContent>
            <div className="food-card-bottom">
              <Typography variant="h6">{formatPrice(item.price)}</Typography>
              <Button
                variant="contained"
                size="small"
                disabled={!item.available}
                onClick={() => handleAdd(item)}
              >
                {item.available ? "Add" : "Unavailable"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {cartIsForThisRestaurant && (
        <Paper className="cart-bar" elevation={4}>
          <Typography>
            {totalQuantity} item{totalQuantity === 1 ? "" : "s"} in cart |
            Estimated {formatPrice(totalPrice)}
          </Typography>
          <Button variant="contained" component={Link} to="/customer/cart">
            View cart
          </Button>
        </Paper>
      )}

      <Dialog open={pendingItem !== null} onClose={() => setPendingItem(null)}>
        <DialogTitle>Replace your cart?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your cart has items from {cart.restaurantName}. A cart can contain
            items from only one restaurant. Do you want to remove those items
            and start a new cart with this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingItem(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleReplaceCart}>
            Replace cart
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MenuPage;
