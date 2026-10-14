
import { useEffect, useRef } from "react";
import "./CustomCursor.css";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    // Custom cursors are only enabled on fine-pointer devices.
    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    if (!media.matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;

    if (!dot || !ring || !label) return;

    let frameId;
    let mouseX = -100;
    let mouseY = -100;
    let ringX = mouseX;
    let ringY = mouseY;
    let visible = false;

    const move = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (!visible) {
        visible = true;
        dot.classList.add("cursor-visible");
        ring.classList.add("cursor-visible");
      }

      dot.style.transform =
        `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      const target = event.target;
      const interactive = target.closest(
        "a, button, [role='button'], input, textarea, select, label"
      );

      const productImage = target.closest(
        ".product-image, .search-product-image, .product-gallery, [data-cursor='view']"
      );

      ring.classList.toggle(
        "cursor-hover",
        Boolean(interactive)
      );

      ring.classList.toggle(
        "cursor-view",
        Boolean(productImage)
      );

      label.textContent = productImage ? "VIEW ↗" : "";
      label.classList.toggle(
        "cursor-label-visible",
        Boolean(productImage)
      );

      ring.style.setProperty(
        "--cursor-x",
        `${mouseX}px`
      );

      ring.style.setProperty(
        "--cursor-y",
        `${mouseY}px`
      );
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      ring.style.transform =
        `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      frameId = window.requestAnimationFrame(animate);
    };

    const leave = () => {
      visible = false;
      dot.classList.remove("cursor-visible");
      ring.classList.remove("cursor-visible");
      ring.classList.remove("cursor-hover", "cursor-view");
      label.classList.remove("cursor-label-visible");
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    frameId = window.requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="custom-cursor" aria-hidden="true">
      <div className="custom-cursor-dot" ref={dotRef} />
      <div className="custom-cursor-ring" ref={ringRef}>
        <span ref={labelRef}>VIEW ↗</span>
      </div>
    </div>
  );
}
