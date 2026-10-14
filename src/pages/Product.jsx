import { useEffect, useMemo, useState } from "react";
import './Product.css'
import api from "../services/api";
import { useCart } from "../context/CartContext";
import FrequentlyBoughtTogether from "../components/FrequentlyBoughtTogether";
import ReviewSection from "../components/ReviewSection";
import { Link, useNavigate, useParams } from "react-router-dom";

const Product = () => {

  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [activeImage, setActiveImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [openAccordion, setOpenAccordion] =
    useState("details");

  // reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [reviewsError, setReviewsError] = useState("");





  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          `/products/${slug}`
        );

        const fetchedProduct =
          response.data.product;

        setProduct(fetchedProduct);

        if (fetchedProduct.variants?.length) {
          const firstVariant =
            fetchedProduct.variants[0];

          setSelectedSize(
            firstVariant.size || ""
          );

          setSelectedColor(
            firstVariant.color || null
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch product:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);


  useEffect(() => {
    if (!product?._id) return;

    let cancelled = false;

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewsError("");

        const response = await api.get(
          `/reviews/product/${product._id}`
        );

        if (cancelled) return;

        setReviews(response.data.reviews || []);
        setReviewSummary(response.data.summary || null);
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to fetch product reviews:", error);
        setReviewsError(
          "Unable to load reviews right now."
        );
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      cancelled = true;
    };
  }, [product?._id]);



  const handleSubmitReview = async (reviewData) => {
    const response = await api.post("/reviews", {
      productId: product._id,
      ...reviewData,
    });

    try {
      const reviewsResponse = await api.get(
        `/reviews/product/${product._id}`
      );

      setReviews(reviewsResponse.data.reviews || []);
      setReviewSummary(reviewsResponse.data.summary || null);
      setReviewsError("");
    } catch (error) {
      console.error("Failed to refresh reviews:", error);
    }

    return response.data;
  };


  /*
   * ---------------------------------------------------------
   * Sizes
   * ---------------------------------------------------------
   */

  const sizes = useMemo(() => {
    if (!product?.variants) return [];

    return [
      ...new Set(
        product.variants
          .map((variant) => variant.size)
          .filter(Boolean)
      ),
    ];
  }, [product]);


  /*
   * ---------------------------------------------------------
   * Colors
   * ---------------------------------------------------------
   */

  const colors = useMemo(() => {
    if (!product?.variants) return [];

    const result = [];

    product.variants.forEach((variant) => {
      if (!variant.color?.name) return;

      const exists = result.some(
        (color) =>
          color.name === variant.color.name
      );

      if (!exists) {
        result.push(variant.color);
      }
    });

    return result;
  }, [product]);


  /*
   * ---------------------------------------------------------
   * Find selected variant
   * ---------------------------------------------------------
   */

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) {
      return null;
    }

    return (
      product.variants.find(
        (variant) =>
          variant.size === selectedSize &&
          variant.color?.name ===
          (selectedColor?.name || "")
      ) || null
    );
  }, [
    product,
    selectedSize,
    selectedColor,
  ]);


  /*
   * ---------------------------------------------------------
   * Stock
   * ---------------------------------------------------------
   */

  const availableStock = selectedVariant
    ? Math.max(
      0,
      selectedVariant.stock -
      selectedVariant.reservedStock
    )
    : null;

  const isOutOfStock =
    selectedVariant &&
    availableStock <= 0;


  /*
   * ---------------------------------------------------------
   * Add to cart
   * ---------------------------------------------------------
   */
  const handleAddToCart = () => {
    // Size required
    if (sizes.length && !selectedSize) {
      alert("Please select a size.");
      return;
    }

    // Color required
    if (colors.length && !selectedColor) {
      alert("Please select a color.");
      return;
    }

    // Variant must exist
    if (!selectedVariant) {
      alert("Please select a valid product variant.");
      return;
    }

    // Variant must have stock
    if (availableStock <= 0) {
      alert("This variant is currently out of stock.");
      return;
    }

    // Quantity cannot exceed available stock
    if (quantity > availableStock) {
      alert("Not enough stock available.");
      return;
    }

    // Add the EXACT selected MongoDB variant
    addToCart(
      product,
      selectedVariant,
      quantity
    );

    alert("Added to cart");
  };


  // handle Buy Now...
  const handleBuyNow = () => {
    if (sizes.length && !selectedSize) {
      alert("Please select a size.");
      return;
    }

    if (colors.length && !selectedColor) {
      alert("Please select a color.");
      return;
    }

    if (!selectedVariant) {
      alert("Please select a valid product variant.");
      return;
    }

    if (availableStock <= 0) {
      alert("This variant is currently out of stock.");
      return;
    }

    if (quantity > availableStock) {
      alert("Not enough stock available.");
      return;
    }


    navigate("/checkout", {
      state: {
        buyNowItem: {
          product: product._id,
          variantId: selectedVariant._id,
          quantity: Number(quantity),

          // Display details for the checkout summary.
          // The backend must still determine the real price.
          name: product.name,
          image: selectedColor
            ? product.colorImages?.find(
              (group) =>
                group.color?.trim().toLowerCase() ===
                selectedColor.name.trim().toLowerCase()
            )?.images?.[0] || product.images?.[0]
            : product.images?.[0],
          price: product.price,
          size: selectedVariant.size,
          color: selectedVariant.color,
        },
      },
    });

  };


  /*
   * ---------------------------------------------------------
   * Images
   * ---------------------------------------------------------
   */



  const colorGallery = useMemo(() => {
    if (!product) return [];

    const selectedColorName = selectedColor?.name
      ?.trim()
      .toLowerCase();

    const matchingColorGallery = product.colorImages?.find(
      (group) =>
        group.color?.trim().toLowerCase() === selectedColorName
    );

    // Use selected color's images when available.
    if (matchingColorGallery?.images?.length) {
      return matchingColorGallery.images;
    }

    // Fallback for older products or colors without their own gallery.
    return product.images || [];
  }, [product, selectedColor]);

  const images = colorGallery.filter(
    (image) => typeof image === "string" && image.trim()
  );

  const closeZoom = () => {
    setIsZoomOpen(false);
    setZoomLevel(1);
  };

  const showPreviousImage = () => {
    setActiveImage((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
    setZoomLevel(1);
  };

  const showNextImage = () => {
    setActiveImage((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
    setZoomLevel(1);
  };



  // Zoom --> effect that you have.
  useEffect(() => {
    if (!isZoomOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeZoom();

      if (event.key === "ArrowLeft" && images.length > 1) {
        showPreviousImage();
      }

      if (event.key === "ArrowRight" && images.length > 1) {
        showNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomOpen, images.length]);




  /*
   * ---------------------------------------------------------
   * Accordion
   * ---------------------------------------------------------
   */

  const toggleAccordion = (name) => {
    setOpenAccordion((current) =>
      current === name ? "" : name
    );
  };



  /*
   * ---------------------------------------------------------
   * Loading
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <main className="product-loading">
        <div className="loading-dot" />
        Loading product...
      </main>
    );
  }


  /*
   * ---------------------------------------------------------
   * Not found
   * ---------------------------------------------------------
   */

  if (!product) {
    return (
      <main className="product-not-found">

        <p>404</p>

        <h1>
          Product not found.
        </h1>

        <Link to="/shop">
          Back to collection →
        </Link>

      </main>
    );
  }




  return (
    <main className="product-page">


      {/* =====================================================
          BREADCRUMB
      ====================================================== */}

      <div className="product-breadcrumb">

        <Link to="/">
          Home
        </Link>

        <span>/</span>

        <Link to="/shop">
          Shop
        </Link>

        <span>/</span>

        <span>
          {product.name}
        </span>

      </div>


      {/* =====================================================
          PRODUCT MAIN
      ====================================================== */}

      <section className="product-layout">


        {/* ===================================================
            GALLERY
        ================================================== */}


        <div className="product-gallery-section">
          <div className="product-gallery">
            {images.length > 0 ? (
              images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={`product-gallery-item ${index === 0 ? "gallery-image-full" : ""
                    }`}
                  onClick={() => {
                    setActiveImage(index);
                    setZoomLevel(1);
                    setIsZoomOpen(true);
                  }}
                  aria-label={`Zoom image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${selectedColor?.name || ""} ${index + 1}`}
                    className="gallery-image"
                    loading={index > 1 ? "lazy" : "eager"}
                  />
                  <span className="gallery-zoom-hint" aria-hidden="true">
                    ⤢
                  </span>
                </button>
              ))
            ) : (
              <div className="product-gallery-empty">
                No product images available.
              </div>
            )}
          </div>
        </div>



        {/* ===================================================
            PRODUCT INFORMATION
        ================================================== */}

        <aside className="product-details">

          <div className="product-details-line" />

          {product.category && (
            <p className="product-category">
              {product.category}
            </p>
          )}

          <h1 className="product-title">
            {product.name}
          </h1>


          {/* Price */}

          <div className="product-detail-price">

            <span className="product-detail-price-current">
              ₹
              {product.price.toLocaleString(
                "en-IN"
              )}
            </span>

            {product.compareAtPrice && (
              <span className="product-detail-price-old">
                ₹
                {product.compareAtPrice.toLocaleString(
                  "en-IN"
                )}
              </span>
            )}

            {product.compareAtPrice &&
              product.compareAtPrice >
              product.price && (
                <span className="product-discount">
                  {Math.round(
                    ((product.compareAtPrice -
                      product.price) /
                      product.compareAtPrice) *
                    100
                  )}
                  % OFF
                </span>
              )}

          </div>


          {/* Description */}

          {product.description && (
            <p className="product-description">
              {product.description}
            </p>
          )}


          {/* =================================================
              SIZE
          ================================================== */}

          {sizes.length > 0 && (

            <div className="variant-group">

              <div className="variant-header">

                <span>
                  Size
                </span>

                <button
                  type="button"
                  className="size-guide"
                >
                  Size guide
                </button>

              </div>


              <div className="variant-options">

                {sizes.map((size) => {

                  const sizeHasStock =
                    product.variants.some(
                      (variant) =>
                        variant.size === size &&
                        variant.stock >
                        variant.reservedStock
                    );

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!sizeHasStock}
                      onClick={() =>
                        setSelectedSize(size)
                      }
                      className={`variant-button ${selectedSize === size
                        ? "active"
                        : ""
                        } ${!sizeHasStock
                          ? "disabled"
                          : ""
                        }`}
                    >
                      {size}
                    </button>
                  );
                })}

              </div>

            </div>
          )}


          {/* =================================================
              COLOR
          ================================================== */}

          {colors.length > 0 && (

            <div className="variant-group">

              <div className="variant-header">

                <span>
                  Color
                </span>

                <span className="selected-color">
                  {selectedColor?.name}
                </span>

              </div>


              <div className="color-options">

                {colors.map((color) => {

                  const colorHasStock =
                    product.variants.some(
                      (variant) =>
                        variant.color?.name ===
                        color.name &&
                        variant.stock >
                        variant.reservedStock
                    );

                  return (
                    <button
                      key={color.name}
                      type="button"
                      disabled={!colorHasStock}
                      onClick={() => {
                        setSelectedColor(color);
                        setActiveImage(0);
                        setZoomLevel(1);
                      }}
                      className={`color-option ${selectedColor?.name ===
                        color.name
                        ? "active"
                        : ""
                        }`}
                      aria-label={color.name}
                      title={color.name}
                    >

                      <span
                        className="color-swatch"
                        style={{
                          backgroundColor:
                            color.hex ||
                            "#ddd",
                        }}
                      />

                    </button>
                  );
                })}

              </div>

            </div>
          )}


          {/* =================================================
              STOCK
          ================================================== */}

          {selectedVariant && (

            <div
              className={`stock-message ${isOutOfStock
                ? "out"
                : ""
                }`}
            >
              {isOutOfStock
                ? "Currently unavailable"
                : availableStock <= 5
                  ? `Only ${availableStock} left`
                  : "In stock"}
            </div>
          )}


          {/* =================================================
              QUANTITY
          ================================================== */}

          <div className="variant-group">

            <div className="variant-header">
              Quantity
            </div>

            <div className="quantity-row">

              <button
                type="button"
                className="quantity-button"
                onClick={() =>
                  setQuantity(
                    Math.max(
                      1,
                      quantity - 1
                    )
                  )
                }
              >
                −
              </button>

              <span className="quantity-value">
                {quantity}
              </span>

              <button
                type="button"
                className="quantity-button"
                disabled={
                  Boolean(
                    selectedVariant &&
                    quantity >=
                    availableStock
                  )
                }
                onClick={() =>
                  setQuantity(
                    quantity + 1
                  )
                }
              >
                +
              </button>

            </div>

          </div>


          {/* =================================================
              ADD TO CART
          ================================================== */}

          <button
            type="button"
            className="add-to-cart"
            disabled={Boolean(isOutOfStock)}
            onClick={handleAddToCart}
          >
            {isOutOfStock
              ? "Out of stock"
              : "Add to cart"}
          </button>


          <button
            type="button"
            className="buy-now-button"
            disabled={Boolean(isOutOfStock)}
            onClick={handleBuyNow}
          >
            {isOutOfStock ? "Out of stock" : "Buy now"}
          </button>


          {/* Adding Frequently Bought Together Here */}
          <FrequentlyBoughtTogether
            product={product}
            relatedProducts={product.relatedProducts || []}
            selectedVariant={selectedVariant}
          />

          {/* =================================================
              PRODUCT ACCORDIONS
          ================================================== */}

          <div className="product-accordions">


            <div className="accordion">

              <button
                type="button"
                className="accordion-button"
                onClick={() =>
                  toggleAccordion("details")
                }
              >
                <span>
                  Product details
                </span>

                <span>
                  {openAccordion ===
                    "details"
                    ? "−"
                    : "+"}
                </span>

              </button>

              {openAccordion === "details" && (
                <div className="accordion-content">

                  <p>
                    {product.description ||
                      "Designed for everyday wear with a focus on comfort, durability and fit."}
                  </p>

                </div>
              )}

            </div>


            <div className="accordion">

              <button
                type="button"
                className="accordion-button"
                onClick={() =>
                  toggleAccordion("shipping")
                }
              >
                <span>
                  Shipping
                </span>

                <span>
                  {openAccordion ===
                    "shipping"
                    ? "−"
                    : "+"}
                </span>

              </button>

              {openAccordion ===
                "shipping" && (
                  <div className="accordion-content">

                    <p>
                      Free shipping on orders
                      above ₹999. Orders below
                      ₹999 have a ₹79 shipping
                      charge.
                    </p>

                  </div>
                )}

            </div>


            <div className="accordion">

              <button
                type="button"
                className="accordion-button"
                onClick={() =>
                  toggleAccordion("returns")
                }
              >
                <span>
                  Returns & exchanges
                </span>

                <span>
                  {openAccordion ===
                    "returns"
                    ? "−"
                    : "+"}
                </span>

              </button>

              {openAccordion ===
                "returns" && (
                  <div className="accordion-content">

                    <p>
                      Return and exchange
                      information will appear
                      here.
                    </p>

                  </div>
                )}

            </div>

          </div>

        </aside>

      </section>


      {/* =====================================================
          PRODUCT STORY
      ====================================================== */}

      <section className="product-editorial">

        <div className="editorial-image-wrapper">

          {images[1] ? (
            <img
              src={images[1]}
              alt={`${product.name} detail`}
              className="editorial-image"
            />
          ) : images[0] ? (
            <img
              src={images[0]}
              alt={product.name}
              className="editorial-image"
            />
          ) : null}

        </div>


        <div className="editorial-content">

          <p className="editorial-eyebrow">
            The idea behind the piece
          </p>

          <h2 className="editorial-title">
            Designed for
            <br />
            everyday life.
          </h2>

          <p className="editorial-text">
            A piece designed to become part of
            your everyday rotation. Clean,
            comfortable and versatile enough to
            move with you.
          </p>

        </div>

      </section>


      {/* =====================================================
          PRODUCT FEATURES
      ====================================================== */}

      <section className="product-features-section">

        <div className="product-features-heading">

          <p className="editorial-eyebrow">
            Why you'll wear it
          </p>

          <h2>
            Details that matter.
          </h2>

        </div>


        <div className="product-feature-grid">

          <div className="product-feature">

            <span>01</span>

            <h3>
              Comfort
            </h3>

            <p>
              Made for long days and everyday
              movement.
            </p>

          </div>


          <div className="product-feature">

            <span>02</span>

            <h3>
              Durability
            </h3>

            <p>
              Built to maintain its shape and
              feel over time.
            </p>

          </div>


          <div className="product-feature">

            <span>03</span>

            <h3>
              Versatility
            </h3>

            <p>
              Easy to wear, easy to pair and
              designed beyond one occasion.
            </p>

          </div>


          <div className="product-feature">

            <span>04</span>

            <h3>
              Fit
            </h3>

            <p>
              A considered silhouette designed
              for everyday wear.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          MORE PRODUCT IMAGES
      ====================================================== */}

      {images.length > 2 && (

        <section className="product-image-strip">

          {images
            .slice(2, 5)
            .map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="product-strip-image"
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 3
                    }`}
                  loading="lazy"
                />
              </div>
            ))}




        </section>

      )}


      {isZoomOpen && images.length > 0 && (
        <div
          className="product-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Product image viewer"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeZoom();
          }}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={closeZoom}
            aria-label="Close image viewer"
          >
            ×
          </button>

          <div className="lightbox-toolbar">
            <span>
              {activeImage + 1} / {images.length}
            </span>

            <button
              type="button"
              onClick={() =>
                setZoomLevel((level) => Math.max(1, level - 0.5))
              }
              disabled={zoomLevel <= 1}
              aria-label="Zoom out"
            >
              −
            </button>

            <button
              type="button"
              onClick={() =>
                setZoomLevel((level) => Math.min(3, level + 0.5))
              }
              disabled={zoomLevel >= 3}
              aria-label="Zoom in"
            >
              +
            </button>

            <button
              type="button"
              onClick={() => setZoomLevel(1)}
            >
              Reset
            </button>
          </div>

          {images.length > 1 && (
            <button
              type="button"
              className="lightbox-arrow lightbox-previous"
              onClick={showPreviousImage}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          <div className="lightbox-image-frame">
            <img
              src={images[activeImage]}
              alt={`${product.name} ${selectedColor?.name || ""}`}
              className="lightbox-image"
              style={{ transform: `scale(${zoomLevel})` }}
              onDoubleClick={() =>
                setZoomLevel((level) => (level > 1 ? 1 : 2))
              }
            />
          </div>

          {images.length > 1 && (
            <button
              type="button"
              className="lightbox-arrow lightbox-next"
              onClick={showNextImage}
              aria-label="Next image"
            >
              ›
            </button>
          )}

          {images.length > 1 && (
            <div className="lightbox-thumbnails">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={activeImage === index ? "active" : ""}
                  onClick={() => {
                    setActiveImage(index);
                    setZoomLevel(1);
                  }}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <ReviewSection
        reviews={reviews}
        loading={reviewsLoading}
        summary={reviewSummary}
        error={reviewsError}
        onSubmitReview={handleSubmitReview}
      />
    </main>
  );
};

export default Product;