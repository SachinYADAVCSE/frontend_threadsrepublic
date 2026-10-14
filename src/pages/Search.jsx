
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "./Search.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const query = searchParams.get("q") || "";

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products");
        const data = response.data;
        const productList = Array.isArray(data)
          ? data
          : data?.products || [];

        if (active) setProducts(productList);
      } catch (err) {
        console.error("Failed to load search products:", err);
        if (active) setError("We couldn't load products. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return [];

    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(term);
    });
  }, [products, query]);

  const handleSearch = (event) => {
    const value = event.target.value;

    setSearchParams(
      value.trim() ? { q: value } : {},
      { replace: true }
    );
  };

  return (
    <main className="search-page">
      <section className="search-page-header">
        <span className="search-eyebrow">THREADSREPUBLIC / DISCOVER</span>

        <h1>
          Find your <em>everyday.</em>
        </h1>

        <p>Search the collection for your next essential.</p>

        <form
          className="search-form"
          onSubmit={(event) => event.preventDefault()}
          role="search"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 5 5" />
          </svg>

          <input
            type="search"
            value={query}
            onChange={handleSearch}
            placeholder="Search t-shirts, trackpants..."
            aria-label="Search products"
            autoFocus
          />

          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchParams({})}
            >
              Clear
            </button>
          )}
        </form>
      </section>

      <section className="search-results">
        <div className="search-results-heading">
          <h2>
            {!query.trim()
              ? "Explore the collection"
              : "Search results"}
          </h2>

          {!loading && query.trim() && !error && (
            <span>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "piece" : "pieces"}
            </span>
          )}
        </div>

        {loading ? (
          <p className="search-message">Loading collection...</p>
        ) : error ? (
          <div className="search-empty">
            <h3>Something went wrong.</h3>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : !query.trim() ? (
          <div className="search-empty">
            <h3>What are you looking for?</h3>
            <p>Try a product name or category.</p>

            <div className="search-suggestions">
              {["T-Shirts", "Trackpants"].map((term) => (
                <button
                  type="button"
                  key={term}
                  onClick={() => setSearchParams({ q: term })}
                >
                  {term}
                  <span>↗</span>
                </button>
              ))}
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="search-empty">
            <h3>No pieces found.</h3>
            <p>
              We couldn't find anything matching "{query}".
              Try another product name or category.
            </p>
          </div>
        ) : (
          <div className="search-product-grid">
            {filteredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product.slug}`}
                className="search-product-card"
              >
                <div className="search-product-image">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                    />
                  ) : (
                    <div className="search-image-placeholder">
                      THREADSREPUBLIC
                    </div>
                  )}

                  <span className="search-product-arrow">↗</span>
                </div>

                <div className="search-product-info">
                  <div>
                    <h3>{product.name}</h3>
                    <span>{product.category || "ESSENTIAL"}</span>
                  </div>

                  <strong>{formatPrice(product.price)}</strong>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
