import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import CustomerHomePage from "./pages/CustomerHomePage.jsx";
import MenuPage from "./pages/MenuPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import MyOrdersPage from "./pages/MyOrdersPage.jsx";
import OwnerDashboardPage from "./pages/OwnerDashboardPage.jsx";
import OwnerRestaurantPage from "./pages/OwnerRestaurantPage.jsx";
import OwnerMenuPage from "./pages/OwnerMenuPage.jsx";
import OwnerOrdersPage from "./pages/OwnerOrdersPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import OffersBanner from "./components/OffersBanner.jsx";

function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <OffersBanner />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer pages */}
          <Route
            element={
              <ProtectedRoute role="CUSTOMER">
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/customer" element={<CustomerHomePage />} />
            <Route path="/customer/restaurants/:id" element={<MenuPage />} />
            <Route path="/customer/cart" element={<CartPage />} />
            <Route path="/customer/checkout" element={<CheckoutPage />} />
            <Route path="/customer/orders" element={<MyOrdersPage />} />
          </Route>

          {/* Owner pages */}
          <Route
            element={
              <ProtectedRoute role="OWNER">
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/owner" element={<OwnerDashboardPage />} />
            <Route path="/owner/restaurant" element={<OwnerRestaurantPage />} />
            <Route path="/owner/menu" element={<OwnerMenuPage />} />
            <Route path="/owner/orders" element={<OwnerOrdersPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
