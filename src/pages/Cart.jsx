import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import './Cart.css'

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export default function Cart() {
  const navigate = useNavigate();

  const {
    cart,
    cartCount,
    subtotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const freeShippingThreshold = 999;
  const shipping =
    subtotal >= freeShippingThreshold ? 0 : subtotal > 0 ? 79 : 0;

  const total = subtotal + shipping;

  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(
    100,
    (subtotal / freeShippingThreshold) * 100
  );

  if (!cart.length) {
    return (
      <main className="cart-page cart-empty-page">
        <div className="cart-empty">
          <span className="cart-eyebrow">YOUR BAG</span>

          <h1>Your bag is empty.</h1>

          <p>
            Discover pieces designed for everyday movement,
            comfort and effortless style.
          </p>

          <Link to="/shop" className="cart-shop-button">
            Explore collection
            <span>↗</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <section className="cart-header">
        <div>
          <span className="cart-eyebrow">YOUR BAG</span>

          <h1>Your collection.</h1>

          <p>
            {cartCount} {cartCount === 1 ? "item" : "items"} selected
          </p>
        </div>

        <Link to="/shop" className="continue-shopping">
          Continue shopping
          <span>↗</span>
        </Link>
      </section>

      {remaining > 0 && (
        <div className="shipping-progress">
          <div className="shipping-progress-top">
            <span>
              Add <strong>{formatPrice(remaining)}</strong> more for free
              shipping
            </span>

            <span>{Math.round(progress)}%</span>
          </div>

          <div className="shipping-progress-track">
            <div
              className="shipping-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {remaining === 0 && (
        <div className="shipping-unlocked">
          <span>✓</span>
          You've unlocked free shipping.
        </div>
      )}

      <section className="cart-layout">
        <div className="cart-items">
          {cart.map((item, index) => (
            <article className="cart-item" key={`${item.product}-${index}`}>
              <Link
                to={`/product/${item.slug}`}
                className="cart-item-image"
              >
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="cart-image-placeholder">
                    No image
                  </div>
                )}
              </Link>

              <div className="cart-item-info">
                <div className="cart-item-main">
                  <div>
                    <span className="cart-item-category">
                      {item.color?.name || "THREADSREPUBLIC"}
                    </span>

                    <Link
                      to={`/product/${item.slug}`}
                      className="cart-item-name"
                    >
                      {item.name}
                    </Link>
                  </div>

                  <strong className="cart-item-price">
                    {formatPrice(item.price * item.quantity)}
                  </strong>
                </div>

                <div className="cart-item-meta">
                  {item.size && (
                    <span>
                      Size <strong>{item.size}</strong>
                    </span>
                  )}

                  {item.color?.name && (
                    <span>
                      Color <strong>{item.color.name}</strong>
                    </span>
                  )}
                </div>

                <div className="cart-item-bottom">
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          index,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(index, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="remove-item"
                    onClick={() => removeFromCart(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="cart-summary">
          <div className="summary-heading">
            <span>SUMMARY</span>
            <span>{cartCount} ITEMS</span>
          </div>

          <div className="summary-lines">
            <div>
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <div>
              <span>Shipping</span>
              <strong>
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </strong>
            </div>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          <button
            className="checkout-button"
            onClick={() => navigate("/checkout")}
          >
            Proceed to checkout
            <span>→</span>
          </button>

          <div className="cart-trust">
            <div>
              <span>✓</span>
              Secure checkout
            </div>

            <div>
              <span>✓</span>
              Easy returns
            </div>

            <div>
              <span>✓</span>
              Quality guaranteed
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}