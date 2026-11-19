import Box from "@mui/material/Box";
import { useAuth } from "../context/AuthContext.jsx";

const offers = [
  "Winter special: hot biryani and soups",
  "Festive season treats from your favourite restaurants",
  "Weekend combo meals",
  "New restaurants added every week",
];

function OffersBanner() {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn || role !== "CUSTOMER") {
    return null;
  }

  return (
    <Box
      className="offers-banner"
      sx={{ backgroundColor: "secondary.main", color: "white" }}
    >
      <div className="offers-track">
        <div className="offers-group">
          {offers.map((text, index) => (
            <span key={index} className="offers-item">
              {text}
            </span>
          ))}
        </div>

        <div className="offers-group" aria-hidden="true">
          {offers.map((text, index) => (
            <span key={index} className="offers-item">
              {text}
            </span>
          ))}
        </div>
      </div>
    </Box>
  );
}

export default OffersBanner;
