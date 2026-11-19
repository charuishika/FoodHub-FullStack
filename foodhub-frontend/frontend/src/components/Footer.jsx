import Box from "@mui/material/Box";
import { useAuth } from "../context/AuthContext.jsx";

// The email, phone and Instagram handle below are placeholders. Replace them with your own.
function Footer() {
  const { role } = useAuth();
  const isOwner = role === "OWNER";

  return (
    <Box
      component="footer"
      className="footer"
      sx={{ backgroundColor: "primary.main", color: "white" }}
    >
      <div className="footer-content">
        <div>
          <strong>FoodHub</strong>
          <div>Order food from your favourite restaurants</div>
        </div>
        <div>
          <strong>{isOwner ? "Owner support" : "Customer support"}</strong>
          <div>
            Email:{" "}
            {isOwner ? "owners@foodhub.example" : "support@foodhub.example"}
          </div>
          <div>Phone: +91 90000 00000</div>
        </div>
        <div>
          <strong>Follow us</strong>
          <div>
            Instagram:{" "}
            <a
              href="https://instagram.com/foodhub_official"
              target="_blank"
              rel="noreferrer"
            >
              @foodhub_official
            </a>
          </div>
        </div>
      </div>
      <div className="footer-copy">© 2026 FoodHub</div>
    </Box>
  );
}

export default Footer;
