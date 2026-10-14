import { Link, useSearchParams } from "react-router-dom";

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();

  const orderNumber =
    searchParams.get("order") ||
    searchParams.get("orderNumber");

  return (
    <main className="order-result-page payment-failed-page">
      <div className="order-result">
        <div className="payment-failed-icon">!</div>

        <span className="order-result-eyebrow">
          PAYMENT NOT COMPLETED
        </span>

        <h1>Not this time.</h1>

        <p>
          Your payment wasn't completed. Your items are still
          in your bag, so you can try again.
        </p>

        {orderNumber && (
          <div className="order-number">
            <span>ORDER REFERENCE</span>
            <strong>{orderNumber}</strong>
          </div>
        )}

        <div className="payment-failed-actions">
          <Link
            to="/checkout"
            className="order-result-button"
          >
            Try payment again
            <span>→</span>
          </Link>

          <Link
            to="/cart"
            className="payment-back-link"
          >
            Return to bag
          </Link>
        </div>
      </div>
    </main>
  );
}