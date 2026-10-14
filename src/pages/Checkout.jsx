
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import "./Checkout.css";

const initialAddress = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useCart();

  const buyNowItem = location.state?.buyNowItem || null;
  const isBuyNow = Boolean(buyNowItem);

  const checkoutItems = useMemo(
    () => (isBuyNow ? [buyNowItem] : cart),
    [isBuyNow, buyNowItem, cart]
  );

  const [shippingAddress, setShippingAddress] =
    useState(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState("PAYU");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (checkoutItems.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [checkoutItems.length, navigate]);

  const subtotal = useMemo(
    () =>
      checkoutItems.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [checkoutItems]
  );

  const shippingCharge = subtotal >= 999 ? 0 : 79;
  const total = subtotal + shippingCharge;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setShippingAddress((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const validateForm = () => {
    const {
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
    } = shippingAddress;

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      return "Please complete all shipping details.";
    }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      return "Enter a valid 10-digit Indian mobile number.";
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      return "Enter a valid 6-digit pincode.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!checkoutItems.length) {
      setError("There are no items to checkout.");
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const invalidItem = checkoutItems.find(
      (item) =>
        !item.product ||
        !item.variantId ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1
    );

    if (invalidItem) {
      setError(
        "A product selection is outdated. Return to the product page or bag and select it again."
      );
      return;
    }

    setLoading(true);

    try {
      // Send only product, variant and quantity.
      // The backend must calculate the actual price and totals.
      const orderPayload = {
        items: checkoutItems.map((item) => ({
          product: item.product,
          variantId: item.variantId,
          quantity: Number(item.quantity),
        })),

        shippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          phone: shippingAddress.phone.trim(),
          address: shippingAddress.address.trim(),
          city: shippingAddress.city.trim(),
          state: shippingAddress.state.trim(),
          pincode: shippingAddress.pincode.trim(),
        },

        paymentMethod,
      };

      // Step 1: create the order and reserve stock.
      const orderResponse = await api.post(
        "/orders",
        orderPayload
      );

      const order = orderResponse.data?.order;

      if (!order?._id) {
        throw new Error("Order creation failed.");
      }

      // COD: do not clear the bag when using Buy Now.
      if (paymentMethod === "COD") {
        if (!isBuyNow) {
          clearCart();
        }

        navigate("/order-success", {
          state: {
            orderId: order._id,
            paymentMethod: "COD",
          },
        });

        return;
      }

      // Step 2: request signed PayU payment details.
      const paymentResponse = await api.post("/payment/payu", {
        orderId: order._id,
      });

      const paymentData = paymentResponse.data;
      const paymentUrl = paymentData?.paymentUrl;
      const paymentFields = paymentData?.data;

      if (
        !paymentUrl ||
        !paymentFields ||
        typeof paymentFields !== "object"
      ) {
        throw new Error(
          "PayU payment URL or payment details are missing."
        );
      }

      // Step 3: submit the payment fields to PayU via POST.
      const paymentForm = document.createElement("form");
      paymentForm.method = "POST";
      paymentForm.action = paymentUrl;
      paymentForm.style.display = "none";

      Object.entries(paymentFields).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        paymentForm.appendChild(input);
      });

      document.body.appendChild(paymentForm);
      paymentForm.submit();
    } catch (err) {
      console.error("Checkout error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while placing your order."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!checkoutItems.length) return null;

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <header className="checkout-header">
          <span className="checkout-eyebrow">
            THREADSREPUBLIC / SECURE CHECKOUT
          </span>
          <h1>
            Almost <em>yours.</em>
          </h1>
          <p>
            {isBuyNow
              ? "Complete your delivery details to buy this piece."
              : "Your essentials are waiting. Complete your order below."}
          </p>

          <div className="checkout-progress">
            <span className="checkout-progress-active">
              <b>01</b> Delivery
            </span>
            <span className="checkout-progress-line" />
            <span>
              <b>02</b> Payment
            </span>
            <span className="checkout-progress-line" />
            <span>
              <b>03</b> Confirmation
            </span>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="checkout-grid"
          noValidate
        >
          <section className="checkout-form-section">
            <div className="checkout-card">
              <div className="checkout-card-header">
                <span className="checkout-step">01</span>
                <div>
                  <h2>Delivery details</h2>
                  <p>
                    Tell us where to deliver your order.
                  </p>
                </div>
              </div>

              <div className="checkout-fields">
                <div className="checkout-field full">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="phone">Mobile number</label>
                  <div className="checkout-phone-input">
                    <span>+91</span>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleChange}
                      placeholder="10-digit number"
                      autoComplete="tel-national"
                      inputMode="numeric"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="checkout-field">
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="checkout-field full">
                  <label htmlFor="address">Street address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleChange}
                    placeholder="House / Flat number, street, area, landmark"
                    autoComplete="street-address"
                    rows={3}
                    maxLength={500}
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleChange}
                    placeholder="Your city"
                    autoComplete="address-level2"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleChange}
                    placeholder="Your state"
                    autoComplete="address-level1"
                    maxLength={100}
                    required
                  />
                </div>
              </div>

              <div className="checkout-address-note">
                <span aria-hidden="true">⌖</span>
                Please double-check your address and mobile number.
              </div>
            </div>

            <div className="checkout-card">
              <div className="checkout-card-header">
                <span className="checkout-step">02</span>
                <div>
                  <h2>Payment method</h2>
                  <p>Choose how you'd like to pay.</p>
                </div>
              </div>

              <div className="payment-options">
                <label
                  className={`payment-option ${
                    paymentMethod === "PAYU" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PAYU"
                    checked={paymentMethod === "PAYU"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                  />
                  <span className="payment-radio" />
                  <span className="payment-option-copy">
                    <strong>Online payment</strong>
                    <span>UPI, cards, net banking and more</span>
                  </span>
                  <span className="payment-option-mark">↗</span>
                </label>

                <label
                  className={`payment-option ${
                    paymentMethod === "COD" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                  />
                  <span className="payment-radio" />
                  <span className="payment-option-copy">
                    <strong>Cash on delivery</strong>
                    <span>Pay when your order arrives</span>
                  </span>
                  <span className="payment-option-mark">₹</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="checkout-error" role="alert">
                <span aria-hidden="true">!</span>
                <p>{error}</p>
              </div>
            )}
          </section>

          <aside className="checkout-summary">
            <div className="checkout-card checkout-summary-card">
              <div className="checkout-summary-heading">
                <div>
                  <span className="checkout-summary-eyebrow">
                    YOUR SELECTION
                  </span>
                  <h2>Order summary</h2>
                </div>
                <span className="checkout-item-count">
                  {checkoutItems.length}{" "}
                  {checkoutItems.length === 1 ? "ITEM" : "ITEMS"}
                </span>
              </div>

              <div className="checkout-items">
                {checkoutItems.map((item, index) => {
                  const colorName =
                    typeof item.color === "string"
                      ? item.color
                      : item.color?.name || "";

                  return (
                    <div
                      className="checkout-item"
                      key={`${item.product}-${item.variantId}-${index}`}
                    >
                      <div className="checkout-item-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name || "Product"} />
                        ) : (
                          <span>TR</span>
                        )}
                        <span className="checkout-item-quantity">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="checkout-item-info">
                        <h3>{item.name || "Selected product"}</h3>
                        <p>
                          {item.size ? `Size: ${item.size}` : ""}
                          {item.size && colorName ? " · " : ""}
                          {colorName ? `Color: ${colorName}` : ""}
                        </p>
                        <span>Qty: {item.quantity}</span>
                      </div>

                      <strong className="checkout-item-price">
                        {formatPrice(
                          Number(item.price || 0) *
                            Number(item.quantity || 0)
                        )}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-shipping-note">
                <span aria-hidden="true">✓</span>
                <span>
                  {shippingCharge === 0
                    ? "You've unlocked free shipping."
                    : `${formatPrice(999 - subtotal)} away from free shipping.`}
                </span>
              </div>

              <div className="checkout-totals">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <div>
                  <span>Shipping</span>
                  <strong>
                    {shippingCharge === 0
                      ? "FREE"
                      : formatPrice(shippingCharge)}
                  </strong>
                </div>
                <div className="checkout-total">
                  <span>Total</span>
                  <strong>{formatPrice(total)}</strong>
                </div>
              </div>

              <button
                type="submit"
                className="checkout-submit"
                disabled={loading}
              >
                {loading
                  ? "Processing your order..."
                  : paymentMethod === "COD"
                    ? "Place order"
                    : "Continue to payment"}
                {!loading && <span aria-hidden="true">↗</span>}
              </button>

              <p className="checkout-secure-note">
                <span aria-hidden="true">⌑</span>
                Your order is processed securely.
              </p>

              <button
                type="button"
                className="checkout-back-link"
                onClick={() =>
                  navigate(isBuyNow ? -1 : "/cart")
                }
                disabled={loading}
              >
                ← {isBuyNow ? "Back to product" : "Return to bag"}
              </button>
            </div>
          </aside>
        </form>

        <footer className="checkout-footer">
          <span>THREADSREPUBLIC</span>
          <span>EVERYDAY / ESSENTIAL / MOVEMENT</span>
        </footer>
      </div>
    </main>
  );
};

export default Checkout;
