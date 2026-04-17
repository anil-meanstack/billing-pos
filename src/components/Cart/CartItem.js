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

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "₹0";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "₹0";
    return `₹${numPrice.toFixed(2)}`;
  };

  // Get the base price (without addons) for display
  const getBasePrice = () => {
    // If we have basePrice stored, use it
    if (item?.basePrice) return item.basePrice;
    
    // For simple items from menu_item
    if (item?.menu_item && !item?.menu_item?.has_variants) {
      return parseFloat(item.menu_item.base_price || 0);
    }
    
    // For variant items
    if (item?.sizePrice) return item.sizePrice;
    
    // Fallback to selectedPrice
    return parseFloat(item?.selectedPrice || 0);
  };

  // Get the final price (WITH addons already included)
  const getFinalPrice = () => {
    // If we have finalPrice from API, use it directly
    if (item?.finalPrice && item.finalPrice > 0) {
      return item.finalPrice;
    }
    
    // Otherwise calculate: basePrice + addons
    const basePrice = getBasePrice();
    const addonsTotal = item?.addons?.reduce((sum, addon) => {
      return sum + (parseFloat(addon.price) || 0);
    }, 0) || 0;
    
    return basePrice + addonsTotal;
  };

  const basePrice = getBasePrice();
  const finalPrice = getFinalPrice();  // This already includes addons
  const itemQuantity = item?.quantity || 1;
  const cartItemId = item?.cartItemId;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      handleRemove();
      return;
    }

    dispatch(updateQuantity({
      itemId: cartItemId,
      sizeKey: item?.size,
      quantity: newQuantity,
    }));

    if (cartItemId && navigator.onLine) {
      dispatch(updateCartItem({ cartItemId, quantity: newQuantity }))
        .then(() => dispatch(loadCart()));
    }
  };

  const handleRemove = () => {
    if (cartItemId && navigator.onLine) {
      dispatch(removeCartItem(cartItemId)).then(() => dispatch(loadCart()));
    }
    dispatch(updateQuantity({
      itemId: cartItemId,
      sizeKey: item?.size,
      quantity: 0,
    }));
  };

  return (
    <div className="cartItem">
      <div className="cartItemMain">
        <button className="removeButton" onClick={handleRemove}>×</button>
        <div className="cartItemInfo">
          <div className="cartItemName">
            {item.name}
            <br />
            <span className="cartItemSize">
              {item.sizeName ? `(${item.sizeName})` : ""} {formatPrice(basePrice)}
            </span>
          </div>
        </div>
        <div className="cartItemControls">
          <button className="quantityButton" onClick={() => handleQuantityChange(itemQuantity - 1)}>−</button>
          <span className="quantityDisplay">{itemQuantity}</span>
          <button className="quantityButton" onClick={() => handleQuantityChange(itemQuantity + 1)}>+</button>
        </div>
        <div className="cartItemSubtotal">
          {formatPrice(finalPrice )}
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