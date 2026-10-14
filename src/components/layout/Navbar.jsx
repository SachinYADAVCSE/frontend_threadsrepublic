import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const { cartCount } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={`site-navbar ${scrolled ? "site-navbar-scrolled" : ""
          }`}
      >
        <div className="navbar-inner">
          <button
            className="navbar-menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <span />
            <span />
          </button>

          <Link to="/" className="navbar-logo">
            THREADS
            <span>REPUBLIC</span>
          </Link>

          <nav className="navbar-links">
            <NavLink to="/shop">Shop</NavLink>
            <a href="/shop#new">New arrivals</a>
            <a href="/shop#featured">Featured</a>
            <a href="/shop#sale">Sale</a>
          </nav>

          <div className="navbar-actions">

            <Link
              to="/search"
              className="navbar-search"
              aria-label="Search products"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 5 5" />
              </svg>
            </Link>



            <Link to="/cart" className="navbar-cart">
              <span>Bag</span>

              {cartCount > 0 && (
                <span className="navbar-cart-count">
                  {cartCount}
                </span>
              )}
            </Link>


          </div>


        </div>
      </header>

      <div
        className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""
          }`}
      >
        <div className="mobile-menu-top">
          <span>MENU</span>

          <button onClick={closeMenu}>Close ×</button>
        </div>

        <nav className="mobile-menu-links">
          <Link to="/shop" onClick={closeMenu}>
            Shop
          </Link>

          <a href="/shop#new" onClick={closeMenu}>
            New arrivals
          </a>

          <a href="/shop#featured" onClick={closeMenu}>
            Featured
          </a>

          <a href="/shop#sale" onClick={closeMenu}>
            Sale
          </a>

          <Link to="/cart" onClick={closeMenu}>
            Your bag
            {cartCount > 0 && ` (${cartCount})`}
          </Link>
        </nav>

        <div className="mobile-menu-footer">
          <span>THREADSREPUBLIC</span>
          <span>EVERYDAY / ESSENTIAL / MOVEMENT</span>
        </div>
      </div>
    </>
  );
}