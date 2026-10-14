
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Shop.css";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [color, setColor] = useState("all");
  const [size, setSize] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products");
        const fetchedProducts = response.data?.products;

        if (!Array.isArray(fetchedProducts)) {
          throw new Error("Unexpected products API response.");
        }

        if (!cancelled) setProducts(fetchedProducts);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        if (!cancelled) {
          setError("We couldn't load the products. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(
    () =>
      [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  );

  const colors = useMemo(
    () =>
      [
        ...new Set(
          products.flatMap((p) =>
            (p.variants || [])
              .map((v) =>
                typeof v.color === "string" ? v.color : v.color?.name
              )
              .filter(Boolean)
          )
        ),
      ].sort(),
    [products]
  );

  const sizes = useMemo(
    () =>
      [
        ...new Set(
          products.flatMap((p) =>
            (p.variants || []).map((v) => v.size).filter(Boolean)
          )
        ),
      ].sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const searchableText = [
        product.name,
        product.description,
        product.category,
        ...(product.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);
      const matchesCategory =
        category === "all" || product.category === category;

      const variants = product.variants || [];

      const matchesColor =
        color === "all" ||
        variants.some((v) => {
          const name =
            typeof v.color === "string" ? v.color : v.color?.name;
          return name?.toLowerCase() === color.toLowerCase();
        });

      const matchesSize =
        size === "all" || variants.some((v) => v.size === size);

      const price = Number(product.price);
      const matchesMin =
        minPrice === "" || price >= Number(minPrice);
      const matchesMax =
        maxPrice === "" || price <= Number(maxPrice);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesColor &&
        matchesSize &&
        matchesMin &&
        matchesMax
      );
    });

    switch (sort) {
      case "price-low":
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-high":
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        break;
      case "featured":
        result.sort(
          (a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured))
        );
        break;
      default:
        break;
    }

    return result;
  }, [products, search, category, color, size, minPrice, maxPrice, sort]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setColor("all");
    setSize("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("featured");
  };

  const activeFilterCount = [
    category !== "all",
    color !== "all",
    size !== "all",
    minPrice !== "",
    maxPrice !== "",
  ].filter(Boolean).length;

  if (loading) {
    return (
      <main className="shop-status">
        <span className="shop-spinner" />
        <p>Loading collection...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="shop-status">
        <p>{error}</p>
        <button
          className="shop-retry"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </main>
    );
  }

  return (
    <main className="shop-page">
      <section className="shop-container">
        <header className="shop-header">
          <div>
            <p className="shop-eyebrow">THREADSREPUBLIC COLLECTION</p>
            <h1>Shop all</h1>
            <p className="shop-subtitle">
              Everyday essentials. Designed for movement.
            </p>
          </div>

          <span className="shop-count">
            {filteredProducts.length} of {products.length} products
          </span>
        </header>

        <section className="shop-toolbar" aria-label="Search and product filters">
          <label className="shop-search">
            <span className="shop-search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
            {search && (
              <button
                type="button"
                className="shop-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>

          <div className="shop-toolbar-actions">
            <button
              type="button"
              className={`shop-filter-toggle ${filtersOpen ? "is-active" : ""}`}
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
            >
              <span aria-hidden="true">☷</span>
              Filters
              {activeFilterCount > 0 && (
                <span className="shop-filter-count">{activeFilterCount}</span>
              )}
            </button>

            <label className="shop-sort">
              <span>Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to high</option>
                <option value="price-high">Price: High to low</option>
              </select>
            </label>
          </div>
        </section>

        {filtersOpen && (
          <section className="shop-filter-panel" aria-label="Product filters">
            <div className="shop-filter-heading">
              <div>
                <h2>Filters</h2>
                <p>Find the right fit for you.</p>
              </div>

              <button
                type="button"
                className="shop-clear-button"
                onClick={clearFilters}
              >
                Clear all
              </button>
            </div>

            <div className="shop-filter-grid">
              <label className="shop-filter-field">
                <span>Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">All categories</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="shop-filter-field">
                <span>Color</span>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                >
                  <option value="all">All colors</option>
                  {colors.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="shop-filter-field">
                <span>Size</span>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                >
                  <option value="all">All sizes</option>
                  {sizes.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <div className="shop-filter-field shop-price-filter">
                <span>Price range (₹)</span>
                <div className="shop-price-inputs">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    aria-label="Minimum price"
                  />
                  <span>—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    aria-label="Maximum price"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="shop-results-heading">
          <span>
            {search ? `Results for "${search}"` : "All products"}
          </span>
          {(activeFilterCount > 0 || search) && (
            <button type="button" onClick={clearFilters}>
              Reset search & filters
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="shop-empty">
            <h2>No products found</h2>
            <p>Try another search or adjust your filters.</p>
            <button
              type="button"
              className="shop-retry"
              onClick={clearFilters}
            >
              Clear search & filters
            </button>
          </div>
        ) : (
          <div className="shop-grid">
            {filteredProducts.map((product) => {
              const image =
                product.colorImages
                  ?.find((group) =>
                    group.images?.some(
                      (url) => typeof url === "string" && url.trim()
                    )
                  )
                  ?.images?.find(
                    (url) => typeof url === "string" && url.trim()
                  ) ||
                product.images?.find(
                  (url) => typeof url === "string" && url.trim()
                );

              const hasDiscount =
                Number(product.compareAtPrice) > Number(product.price);

              const discount = hasDiscount
                ? Math.round(
                    (1 -
                      Number(product.price) /
                        Number(product.compareAtPrice)) *
                      100
                  )
                : 0;

              return (
                <Link
                  key={product._id}
                  to={`/product/${product.slug}`}
                  className="shop-card"
                >
                  <div className="shop-card-image">
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="shop-no-image">
                        <span>No image available</span>
                      </div>
                    )}

                    {hasDiscount && (
                      <span className="shop-sale-badge">
                        {discount}% OFF
                      </span>
                    )}

                    <span className="shop-view-label">View product ↗</span>
                  </div>

                  <div className="shop-card-info">
                    <h2>{product.name}</h2>
                    <div className="shop-price-row">
                      <span className="shop-price">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>
                      {hasDiscount && (
                        <span className="shop-compare-price">
                          ₹{Number(product.compareAtPrice).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default Shop;
