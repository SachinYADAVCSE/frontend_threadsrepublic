import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            THREADS
            <span>REPUBLIC</span>
          </Link>

          <p>
            Everyday clothing designed around movement,
            comfort and a quieter kind of confidence.
          </p>

          <div className="footer-socials">
            <a href="#" aria-label="Instagram">
              Instagram
            </a>

            <a href="#" aria-label="Facebook">
              Facebook
            </a>

            <a href="#" aria-label="Pinterest">
              Pinterest
            </a>
          </div>
        </div>

        <div className="footer-column">
          <span className="footer-column-title">SHOP</span>

          <Link to="/shop">All products</Link>
          <Link to="/shop">New arrivals</Link>
          <Link to="/shop">Featured</Link>
          <Link to="/shop">Sale</Link>
        </div>

        <div className="footer-column">
          <span className="footer-column-title">HELP</span>

          <Link to="/cart">Your bag</Link>
          <a href="#shipping">Shipping</a>
          <a href="#returns">Returns</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="footer-column">
          <span className="footer-column-title">COMPANY</span>

          <a href="#story">Our story</a>
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
        </div>

        <div className="footer-newsletter">
          <span className="footer-column-title">
            STAY IN THE LOOP
          </span>

          <h3>
            Good things
            <br />
            <em>occasionally.</em>
          </h3>

          <p>
            New releases, restocks and everything happening
            at ThreadsRepublic.
          </p>

          <form
            className="newsletter-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address"
              required
            />

            <button type="submit" aria-label="Subscribe">
              →
            </button>
          </form>
        </div>
      </div>

      <div className="footer-marquee">
        <div>
          THREADSREPUBLIC — MADE FOR EVERYDAY — THREADSREPUBLIC —
          MADE FOR EVERYDAY — THREADSREPUBLIC — MADE FOR EVERYDAY —
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} ThreadsRepublic
        </span>

        <span>Made in India</span>

        <span>All rights reserved.</span>
      </div>
    </footer>
  );
}