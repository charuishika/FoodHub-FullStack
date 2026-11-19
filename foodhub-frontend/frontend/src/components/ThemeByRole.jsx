import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useAuth } from "../context/AuthContext.jsx";
import { customerTheme, ownerTheme } from "../theme.js";

// Picks the theme from the logged-in role. Buttons, navbar and chips change color automatically.
function ThemeByRole({ children }) {
  const { role } = useAuth();
  const theme = role === "OWNER" ? ownerTheme : customerTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default ThemeByRole;
