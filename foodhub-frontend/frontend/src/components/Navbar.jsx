import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import { useAuth, getHomePath } from "../context/AuthContext.jsx";
import { clearCart, selectTotalQuantity } from "../redux/cartSlice.js";

function Navbar() {
  const { user, isLoggedIn, role, logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const totalQuantity = useSelector(selectTotalQuantity);

  function handleLogout() {
    dispatch(clearCart()); // the cart belongs to the person who logged in
    logout();
    navigate("/login");
  }

  return (
    <AppBar position="static">
      <Toolbar className="navbar-toolbar">
        <Typography
          variant="h6"
          component={Link}
          to={isLoggedIn ? getHomePath(user.role) : "/"}
          sx={{ color: "white", textDecoration: "none" }}
        >
          FoodHub
        </Typography>

        {isLoggedIn && role === "CUSTOMER" && (
          <div className="navbar-links">
            <Button color="inherit" component={Link} to="/customer">
              Restaurants
            </Button>
            <Button color="inherit" component={Link} to="/customer/orders">
              My Orders
            </Button>
            <Button color="inherit" component={Link} to="/customer/cart">
              <Badge
                badgeContent={totalQuantity}
                color="secondary"
                sx={{ paddingRight: "8px" }}
              >
                Cart
              </Badge>
            </Button>
          </div>
        )}

        {isLoggedIn && role === "OWNER" && (
          <div className="navbar-links">
            <Button color="inherit" component={Link} to="/owner">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/owner/restaurant">
              Restaurant
            </Button>
            <Button color="inherit" component={Link} to="/owner/menu">
              Menu
            </Button>
            <Button color="inherit" component={Link} to="/owner/orders">
              Orders
            </Button>
          </div>
        )}

        <div className="navbar-right">
          {isLoggedIn ? (
            <>
              <Typography variant="body2" className="navbar-name">
                {user.name} ({user.role})
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
