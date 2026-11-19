import { Link } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

// Shown on owner pages when the owner has not created a restaurant yet
function NoRestaurantNotice() {
  return (
    <div>
      <Alert severity="info" className="status-box">
        You have not created a restaurant yet. Create it first.
      </Alert>
      <Button variant="contained" component={Link} to="/owner/restaurant">
        Create restaurant
      </Button>
    </div>
  );
}

export default NoRestaurantNotice;
