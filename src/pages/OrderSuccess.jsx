import { Link, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useCart } from "../context/CartContext";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  const orderNumber =
    searchParams.get("order") || searchParams.get("orderNumber");

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="order-result-page">
      <div className="order-result">
        <div className="order-result-icon">✓</div>

        <span className="order-result-eyebrow">
          ORDER CONFIRMED
        </span>

        <h1>Thank you.</h1>

        <p>
          Your payment was successful and your order is now being
          prepared.
        </p>

        {orderNumber && (
          <div className="order-number">
            <span>ORDER NUMBER</span>
            <strong>{orderNumber}</strong>
          </div>
        )}

        <Link to="/shop" className="order-result-button">
          Continue shopping
          <span>↗</span>
        </Link>
      </div>
    </main>
  );
}