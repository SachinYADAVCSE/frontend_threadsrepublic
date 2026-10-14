import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();

const CART_STORAGE_KEY = "threadsRepublicCart";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // --------------------------------------------------
  // Load cart from localStorage
  // --------------------------------------------------

  useEffect(() => {
    try {
      const storedCart =
        localStorage.getItem(CART_STORAGE_KEY);

      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load cart:",
        error
      );
    }
  }, []);


  // --------------------------------------------------
  // Save cart to localStorage
  // --------------------------------------------------

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error(
        "Failed to save cart:",
        error
      );
    }
  }, [cart]);


  // --------------------------------------------------
  // Add product to cart
  // --------------------------------------------------

  const addToCart = (
    product,
    selectedVariant,
    quantity = 1
  ) => {
    if (!product?._id) {
      console.error(
        "Cannot add product without ID"
      );

      return;
    }


    if (!selectedVariant?._id) {
      console.error(
        "Cannot add product without variant ID"
      );

      return;
    }


    const variantId =
      selectedVariant._id;


    setCart((currentCart) => {

      const existingItemIndex =
        currentCart.findIndex(
          (item) =>
            item.product === product._id &&
            item.variantId === variantId
        );


      // ----------------------------------------------
      // Existing variant
      // ----------------------------------------------

      if (existingItemIndex !== -1) {
        return currentCart.map(
          (item, index) =>
            index === existingItemIndex
              ? {
                  ...item,
                  quantity:
                    item.quantity + quantity,
                }
              : item
        );
      }


      // ----------------------------------------------
      // New variant
      // ----------------------------------------------

      return [
        ...currentCart,

        {
          product: product._id,

          variantId,

          name: product.name,

          slug: product.slug,

          image:
            product.images?.[0] || "",

          price: product.price,

          size:
            selectedVariant.size || "",

          color: {
            name:
              selectedVariant.color?.name ||
              "",

            hex:
              selectedVariant.color?.hex ||
              "",
          },

          quantity,
        },
      ];
    });
  };


  // --------------------------------------------------
  // Remove item
  // --------------------------------------------------

  const removeFromCart = (
    productId,
    variantId
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          !(
            item.product === productId &&
            item.variantId === variantId
          )
      )
    );
  };


  // --------------------------------------------------
  // Update quantity
  // --------------------------------------------------

  const updateQuantity = (
    productId,
    variantId,
    quantity
  ) => {
    const nextQuantity =
      Number(quantity);


    if (
      !Number.isInteger(nextQuantity) ||
      nextQuantity < 1
    ) {
      return;
    }


    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product === productId &&
        item.variantId === variantId
          ? {
              ...item,
              quantity: nextQuantity,
            }
          : item
      )
    );
  };


  // --------------------------------------------------
  // Clear cart
  // --------------------------------------------------

  const clearCart = () => {
    setCart([]);
  };


  // --------------------------------------------------
  // Cart count
  // --------------------------------------------------

  const cartCount = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + item.quantity,
        0
      ),
    [cart]
  );


  // --------------------------------------------------
  // Cart subtotal
  // --------------------------------------------------

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) *
            item.quantity,
        0
      ),
    [cart]
  );


  return (
    <CartContext.Provider
      value={{
        cart,

        cartCount,

        subtotal,

        addToCart,

        removeFromCart,

        updateQuantity,

        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};


export const useCart = () => {
  const context =
    useContext(CartContext);


  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }


  return context;
};