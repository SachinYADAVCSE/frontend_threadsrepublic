
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import "./FrequentlyBoughtTogether.css";

const getAvailableStock = (variant) =>
  Math.max(0, (variant?.stock ?? 0) - (variant?.reservedStock ?? 0));

const getFirstAvailableVariant = (product) =>
  product?.variants?.find((variant) => getAvailableStock(variant) > 0) ||
  null;

const getVariantLabel = (variant) => {
  if (!variant) return "Unavailable";

  const parts = [variant.size, variant.color?.name].filter(Boolean);
  return parts.length ? parts.join(" / ") : "Default variant";
};

const FrequentlyBoughtTogether = ({
  product,
  relatedProducts = [],
  selectedVariant,
}) => {
  const { addToCart } = useCart();

  const recommendations = useMemo(
    () =>
      relatedProducts.filter(
        (item) =>
          item?._id &&
          item._id !== product?._id &&
          item.isActive !== false
      ),
    [relatedProducts, product?._id]
  );

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});

  useEffect(() => {
    setSelectedIds(recommendations.map((item) => item._id));

    setSelectedVariants(
      Object.fromEntries(
        recommendations.map((item) => [
          item._id,
          getFirstAvailableVariant(item)?._id || "",
        ])
      )
    );
  }, [recommendations]);

  if (!recommendations.length) return null;

  const currentProductAvailable =
    selectedVariant && getAvailableStock(selectedVariant) > 0;

  const selectedRecommendations = recommendations.filter((item) =>
    selectedIds.includes(item._id)
  );

  const chosenItems = selectedRecommendations.map((item) => ({
    product: item,
    variant: item.variants?.find(
      (variant) => variant._id === selectedVariants[item._id]
    ),
  }));

  const bundleItems = [
    {
      product,
      variant: selectedVariant,
    },
    ...chosenItems,
  ];

  const total = bundleItems.reduce((sum, item) => {
    if (!item.variant) return sum;
    return sum + Number(item.product.price || 0);
  }, 0);

  const allSelectedItemsAvailable =
    currentProductAvailable &&
    chosenItems.every(
      ({ variant }) => variant && getAvailableStock(variant) > 0
    );

  const toggleProduct = (productId) => {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const handleAddBundle = () => {
    if (!allSelectedItemsAvailable) {
      alert("Please select an available variant for every selected product.");
      return;
    }

    for (const item of bundleItems) {
      if (getAvailableStock(item.variant) < 1) {
        alert(`${item.product.name} is out of stock.`);
        return;
      }
    }

    // Add the current product and each selected recommendation.
    // CartContext merges duplicate product/variant combinations.
    for (const item of bundleItems) {
      addToCart(item.product, item.variant, 1);
    }

    alert("Selected products added to cart.");
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  return (
    <section className="fbt-section">
      <div className="fbt-heading">
        <p className="fbt-eyebrow">COMPLETE THE LOOK</p>
        <h2>Frequently bought together</h2>
        <p>Pieces that work better together.</p>
      </div>

      <div className="fbt-products">
        {/* The current product is always included. */}
        <article className="fbt-card">
          <div className="fbt-image-wrap">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} />
            ) : (
              <div className="fbt-image-placeholder">No image</div>
            )}
            <span className="fbt-current-label">THIS ITEM</span>
          </div>

          <h3>{product.name}</h3>
          <p className="fbt-variant-label">
            {getVariantLabel(selectedVariant)}
          </p>
          <strong>{formatPrice(product.price)}</strong>
        </article>

        {recommendations.map((item) => {
          const isSelected = selectedIds.includes(item._id);
          const variant = item.variants?.find(
            (entry) => entry._id === selectedVariants[item._id]
          );

          const availableVariants =
            item.variants?.filter(
              (entry) => getAvailableStock(entry) > 0
            ) || [];

          return (
            <article className="fbt-card" key={item._id}>
              <label className="fbt-select">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleProduct(item._id)}
                  aria-label={`Include ${item.name}`}
                />
                <span>Include item</span>
              </label>

              <div className="fbt-image-wrap">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name} />
                ) : (
                  <div className="fbt-image-placeholder">No image</div>
                )}
              </div>

              <h3>{item.name}</h3>
              <strong>{formatPrice(item.price)}</strong>

              {isSelected && (
                <div className="fbt-variant-control">
                  <label htmlFor={`fbt-variant-${item._id}`}>
                    Size / color
                  </label>

                  <select
                    id={`fbt-variant-${item._id}`}
                    value={selectedVariants[item._id] || ""}
                    onChange={(event) =>
                      setSelectedVariants((current) => ({
                        ...current,
                        [item._id]: event.target.value,
                      }))
                    }
                    disabled={!availableVariants.length}
                  >
                    <option value="" disabled>
                      Choose a variant
                    </option>

                    {availableVariants.map((entry) => (
                      <option key={entry._id} value={entry._id}>
                        {getVariantLabel(entry)} — In stock
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!availableVariants.length && (
                <p className="fbt-unavailable">Currently unavailable</p>
              )}
            </article>
          );
        })}
      </div>

      <div className="fbt-summary">
        <div>
          <span>Bundle total</span>
          <strong>{formatPrice(total)}</strong>
          <p>
            {1 + selectedIds.length}{" "}
            {1 + selectedIds.length === 1 ? "item" : "items"} selected
          </p>
        </div>

        <button
          type="button"
          className="fbt-add-button"
          onClick={handleAddBundle}
          disabled={!currentProductAvailable || !allSelectedItemsAvailable}
        >
          Add selected items to cart
        </button>
      </div>
    </section>
  );
};

export default FrequentlyBoughtTogether;
