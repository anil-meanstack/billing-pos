import React from "react";
import { useDispatch } from "react-redux";
import {
  updateQuantity,
  removeCartItem,
  updateCartItem,
  loadCart,
} from "../../features/cart/cartSlice";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();


  // Helper to safely get nested menu item data
  const getMenuItem = () => {
    return item?.menu_item || item || {};
  };

  // Safe price formatter
  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "₹0";
    }

    const numPrice = typeof price === "string" ? parseFloat(price) : price;

    if (isNaN(numPrice)) {
      return "₹0";
    }

    return `₹${numPrice.toFixed(2)}`;
  };

  // Get the selected variant from the menu_item
  const getSelectedVariant = () => {
    const menuItem = getMenuItem();
    const variantId = item?.variant_id;

    if (!menuItem?.variants || !variantId) return null;

    // Find the variant group and the selected variant
    for (const variantGroup of menuItem.variants) {
      const found = variantGroup.variants?.find(v => v.id === variantId);
      if (found) return found;
    }
    return null;
  };

  // EMERGENCY PRICE EXTRACTION - Try every possible path
  const extractPriceFromItem = () => {
    // Path 1: Check selected variant
    const selectedVariant = getSelectedVariant();
    if (selectedVariant?.final_price) {
      const price = parseFloat(selectedVariant.final_price);
      if (!isNaN(price) && price > 0) return price;
    }

    // Path 2: Look through all variants
    const menuItem = getMenuItem();
    if (menuItem?.variants && menuItem.variants.length > 0) {
      for (const variantGroup of menuItem.variants) {
        if (variantGroup.variants && variantGroup.variants.length > 0) {
          // Try to find by variant_id
          const exactMatch = variantGroup.variants.find(v => v.id === item?.variant_id);
          if (exactMatch?.final_price) {
            const price = parseFloat(exactMatch.final_price);
            if (!isNaN(price) && price > 0) return price;
          }

          // Try first variant as fallback
          const firstVariant = variantGroup.variants[0];
          if (firstVariant?.final_price) {
            const price = parseFloat(firstVariant.final_price);
            if (!isNaN(price) && price > 0) return price;
          }
        }
      }
    }

    // Path 3: Check min_price
    if (menuItem?.min_price) {
      const price = parseFloat(menuItem.min_price);
      if (!isNaN(price) && price > 0) return price;
    }

    // Path 4: Check direct price fields on item
    // const directPrice =  item?.unit_price || item?.price || item?.base_price || item?.sizePrice || item?.selectedPrice;
    const directPrice =
      item?.unit_price ||   // normal item
      item?.price ||        // custom item (IMPORTANT)
      item?.base_price ||
      item?.sizePrice ||
      item?.selectedPrice;

    if (directPrice) {
      const price = parseFloat(directPrice);
      if (!isNaN(price) && price > 0) return price;
    }

    return 0;
  };

  // Safe getters for item properties
  const getItemName = () => {
    const menuItem = getMenuItem();
    return menuItem?.name || item?.name || item?.custom_name || "Item";
  };

  const getItemQuantity = () => {
    const qty = item?.quantity ?? 1;
    return Math.max(1, parseInt(qty) || 1);
  };

  const getItemId = () => {
    return item?.menu_item_id || item?.id || "";
  };

  const getCartItemId = () => {
    return item?.cart_item_id || item?.cartItemId ||  "";
  };

  const getItemSize = () => {
    return item?.size || "";
  };

  const getItemSizeName = () => {
    const selectedVariant = getSelectedVariant();
    if (selectedVariant?.name) {
      return selectedVariant.name;
    }
    return item?.sizeName || item?.size || "Regular";
  };

  const getBasePrice = () => {
    return extractPriceFromItem();
  };

  const getFinalPrice = () => {
    const basePrice = getBasePrice();
    const addons = item?.addons || [];

    const addonsTotal = addons.reduce((sum, addon) => {
      return sum + (parseFloat(addon.price) || 0);
    }, 0);

    return basePrice + addonsTotal;
  };

  const basePrice = getBasePrice();
  const finalPrice = getFinalPrice();
  const itemQuantity = getItemQuantity();
  // const itemId = getItemId();
  // const cartItemId = getCartItemId();
  // const cartItemId = getCartItemId();
  // const itemId = cartItemId;
  // const cartItemId = item?.cartItemId;
  // const cartItemId = item?.cartItemId || item?.id;
  const cartItemId = item?.cartItemId;
  const itemSize = getItemSize();
  const itemSizeName = getItemSizeName();
  const itemName = getItemName();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      handleRemove();
      return;
    }

    // Update local state immediately
    dispatch(
      updateQuantity({
        itemId: cartItemId || item.id,
        sizeKey: itemSize,
        quantity: newQuantity,
      })
    );

    // Then sync with server if online
    if (cartItemId && navigator.onLine) {
      dispatch(
        updateCartItem({
          cartItemId: cartItemId,
          quantity: newQuantity,
        })
      ).then(() => {
        dispatch(loadCart());
      });
    } else {
      console.log("Offline: Quantity updated locally");
    }
  };

  // const handleRemove = () => {
  //   if (cartItemId && navigator.onLine) {
  //     dispatch(removeCartItem(cartItemId)).then(() => {
  //       dispatch(loadCart());
  //     });
  //   }

  //   dispatch(
  //     updateQuantity({
  //       itemId: itemId,
  //       sizeKey: itemSize,
  //       quantity: 0,
  //     })
  //   );
  // };
const handleRemove = () => {
  const uniqueId = item?.cartItemId;

  // API remove
  if (item?.cartItemId && navigator.onLine) {
    dispatch(removeCartItem(item.cartItemId)).then(() => {
      dispatch(loadCart());
    });
  }

  // Local remove
  dispatch(
    updateQuantity({
      itemId: uniqueId,
      sizeKey: itemSize,
      quantity: 0,
    })
  );
};
  // Don't render if item is invalid
  if (!item) {
    return null;
  }

  return (
    <div className="cartItem">
      <div className="cartItemMain">
        <button className="removeButton" onClick={handleRemove}>
          ×
        </button>
        <div className="cartItemInfo">
          <div className="cartItemName">
            {itemName}
            <br />
            {/* {itemSizeName && (
              <span className="cartItemSize">({itemSizeName}) {formatPrice(basePrice)} </span>
            )} */}
            <span className="cartItemSize">
              {itemSizeName ? `(${itemSizeName})` : ""} {formatPrice(basePrice)}
            </span>
          </div>

        </div>
        <div className="cartItemControls">
          <button
            className="quantityButton"
            onClick={() => handleQuantityChange(itemQuantity - 1)}
          >
            −
          </button>
          <span className="quantityDisplay">{itemQuantity}</span>
          <button
            className="quantityButton"
            onClick={() => handleQuantityChange(itemQuantity + 1)}
          >
            +
          </button>
        </div>
        <div className="cartItemSubtotal">
          {formatPrice(finalPrice * itemQuantity)}
        </div>
      </div>

      {/* Display addons if any */}
      {item?.addons && item.addons.length > 0 && (
        <div className="cartItemAddons">
          <small className="text-muted">Addons:</small>
          {item.addons.map((addon, index) => (
            <div key={index} className="addon-detail">
              <span>{addon.name}</span>
              <span> {formatPrice(addon.price)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartItem;