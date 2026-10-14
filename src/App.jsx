import "./App.css";

import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import { useLocation } from "react-router-dom";
import Search from "./pages/Search";
import CustomCursor from "./components/CustomCursor";

function AppContent() {
  const location = useLocation();

  const hideFooter = location.pathname === "/checkout";

  return (
    <>
      <Navbar />
      <CustomCursor />

      <Routes>

        <Route path="/search" element={<Search />} />
        
        <Route path="/" element={<Home />} />

        <Route path="/shop" element={<Shop />} />

        <Route
          path="/product/:slug"
          element={<Product />}
        />

        <Route path="/cart" element={<Cart />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />

        <Route
          path="/payment-failed"
          element={<PaymentFailed />}
        />

      </Routes>

      {!hideFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
