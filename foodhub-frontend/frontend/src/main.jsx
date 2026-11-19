import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ThemeByRole from "./components/ThemeByRole.jsx";
import { store } from "./redux/store.js";
import "./styles/main.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeByRole>
            <App />
          </ThemeByRole>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
