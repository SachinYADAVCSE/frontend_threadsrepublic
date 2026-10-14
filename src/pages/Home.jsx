import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");

        setProducts(response.data?.products || response.data || []);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const featuredProducts = products
    .filter((product) => product.isFeatured)
    .slice(0, 4);

  const displayProducts =
    featuredProducts.length > 0
      ? featuredProducts
      : products.slice(0, 4);

  return (
    <main className="home-page">
      {/* =========================================
          HERO
      ========================================= */}

      <section className="home-hero">
        <div className="hero-background-text">
          EVERYDAY
        </div>

        <div className="home-hero-content">
          <div className="home-hero-copy">
            <span className="home-eyebrow">
              THREADSREPUBLIC / 001
            </span>

            <h1>
              Clothes
              <br />
              <em>for movement.</em>
            </h1>

            <p>
              Everyday essentials designed around comfort,
              movement and a quieter kind of confidence.
            </p>

            <div className="home-hero-actions">
              <Link to="/shop" className="primary-home-button">
                Explore collection
                <span>↗</span>
              </Link>

              <a href="#story" className="secondary-home-button">
                Our approach
              </a>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="hero-image-frame">
              <img
                src={
                  products[0]?.images?.[0] ||
                  "/hero.png"
                }
                alt="ThreadsRepublic collection"
              />
            </div>

            <div className="hero-floating-card">
              <span>01 / 04</span>
              <strong>THE EVERYDAY TEE</strong>
              <small>
                Built for wherever the day takes you.
              </small>
            </div>
          </div>
        </div>

        <div className="hero-scroll">
          <span>SCROLL TO EXPLORE</span>
          <div />
        </div>
      </section>

      {/* =========================================
          MARQUEE
      ========================================= */}

      <section className="home-marquee">
        <div className="marquee-track">
          <span>MADE FOR EVERYDAY</span>
          <i>✳</i>
          <span>BUILT TO MOVE</span>
          <i>✳</i>
          <span>DESIGNED TO LAST</span>
          <i>✳</i>

          <span>MADE FOR EVERYDAY</span>
          <i>✳</i>
          <span>BUILT TO MOVE</span>
          <i>✳</i>
          <span>DESIGNED TO LAST</span>
          <i>✳</i>
        </div>
      </section>

      {/* =========================================
          INTRO
      ========================================= */}

      <section id="story" className="home-intro">
        <div className="home-section-label">
          <span>02</span>
          <span>THE IDEA</span>
        </div>

        <div className="home-intro-content">
          <h2>
            We don't make clothes
            <br />
            for <em>one occasion.</em>
          </h2>

          <div className="home-intro-description">
            <p>
              ThreadsRepublic is built around the idea that
              your everyday clothes should keep up with your
              everyday life.
            </p>

            <p>
              Clean silhouettes. Considered materials.
              Functional details. Nothing unnecessary.
            </p>

            <Link to="/shop" className="text-arrow-link">
              Discover the collection
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          FEATURED PRODUCTS
      ========================================= */}

      <section className="home-products">
        <div className="home-section-heading">
          <div>
            <span className="home-eyebrow">03 / COLLECTION</span>

            <h2>
              Pieces you'll
              <br />
              <em>keep reaching for.</em>
            </h2>
          </div>

          <Link to="/shop" className="text-arrow-link">
            View all
            <span>→</span>
          </Link>
        </div>

        {loading ? (
          <div className="home-products-loading">
            Loading collection...
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="home-products-loading">
            Collection coming soon.
          </div>
        ) : (
          <div className="home-product-grid">
            {displayProducts.map((product, index) => (
              <Link
                key={product._id}
                to={`/product/${product.slug}`}
                className="home-product-card"
              >
                <div className="home-product-image">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                    />
                  )}

                  {index === 0 && (
                    <span className="home-product-badge">
                      EDITOR'S PICK
                    </span>
                  )}

                  <span className="home-product-index">
                    0{index + 1}
                  </span>
                </div>

                <div className="home-product-info">
                  <div>
                    <strong>{product.name}</strong>

                    <span>
                      {product.category || "ESSENTIAL"}
                    </span>
                  </div>

                  <strong>
                    {formatPrice(product.price)}
                  </strong>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* =========================================
          CATEGORY SPLIT
      ========================================= */}

      <section className="home-categories">
        <div className="home-section-label">
          <span>04</span>
          <span>EXPLORE</span>
        </div>

        <div className="category-grid">
          <Link
            to="/shop?category=T-Shirts"
            className="category-card category-card-large"
          >
            <div className="category-card-image">
              <img
                src={
                  displayProducts[0]?.images?.[0] ||
                  "/hero.png"
                }
                alt="T-shirts"
              />
            </div>

            <div className="category-card-overlay">
              <span>01</span>

              <div>
                <h3>T-Shirts</h3>
                <p>Everyday foundations.</p>
              </div>

              <span>↗</span>
            </div>
          </Link>

          <div className="category-small-column">
            <Link
              to="/shop?category=Trackpants"
              className="category-card"
            >
              <div className="category-card-image">
                <img
                  src={
                    displayProducts[1]?.images?.[0] ||
                    displayProducts[0]?.images?.[0] ||
                    "/hero.png"
                  }
                  alt="Trackpants"
                />
              </div>

              <div className="category-card-overlay">
                <span>02</span>

                <div>
                  <h3>Trackpants</h3>
                  <p>Built to move.</p>
                </div>

                <span>↗</span>
              </div>
            </Link>

            <Link
              to="/shop"
              className="category-card category-card-minimal"
            >
              <span>03</span>

              <div>
                <h3>All pieces</h3>
                <p>Explore everything.</p>
              </div>

              <span>↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          BRAND STATEMENT
      ========================================= */}

      <section className="home-statement">
        <div className="statement-number">05</div>

        <div className="statement-content">
          <span className="home-eyebrow">
            A DIFFERENT KIND OF ESSENTIAL
          </span>

          <h2>
            Less noise.
            <br />
            <em>More life.</em>
          </h2>

          <p>
            We believe great clothing shouldn't compete
            with the person wearing it. It should simply
            make moving through the day feel better.
          </p>
        </div>
      </section>

      {/* =========================================
          EDITORIAL IMAGE
      ========================================= */}

      <section className="home-editorial">
        <div className="editorial-image">
          <img
            src={
              displayProducts[2]?.images?.[0] ||
              displayProducts[0]?.images?.[0] ||
              "/hero.png"
            }
            alt="ThreadsRepublic editorial"
          />
        </div>

        <div className="editorial-copy">
          <span className="home-eyebrow">
            DESIGNED AROUND REAL LIFE
          </span>

          <h2>
            From first coffee
            <br />
            to <em>last train.</em>
          </h2>

          <p>
            Pieces that don't need an occasion. Wear them
            to the gym, to work, on the road, or nowhere in
            particular.
          </p>

          <Link to="/shop" className="primary-home-button">
            Shop the essentials
            <span>↗</span>
          </Link>
        </div>
      </section>

      {/* =========================================
          FINAL CTA
      ========================================= */}

      <section className="home-final-cta">
        <div className="home-final-background">
          THREADS
        </div>

        <div className="home-final-content">
          <span className="home-eyebrow">
            06 / START HERE
          </span>

          <h2>
            Find your
            <br />
            <em>everyday.</em>
          </h2>

          <Link to="/shop" className="final-shop-button">
            Explore ThreadsRepublic
            <span>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}