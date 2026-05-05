import { useDispatch, useSelector } from "react-redux";
import { removeCartItem, updateCartItem, loadTableOrders, dineRemoveCartItem } from "../../../features/cart/cartSlice";

const CartItem = ({ item }) => {

  const dispatch = useDispatch();
  const { orderType, tableId, activeTableOrder } = useSelector((state) => state.cart);

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "₹0";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "₹0";
    return `₹${numPrice.toFixed(2)}`;
  };

  const getBasePrice = () => {
    if (item?.sizePrice && item.sizePrice > 0) {
      return Number(item.sizePrice);
    }

    if (item?.base_price && item.base_price > 0) {
      return Number(item.base_price);
    }

    return Number(item?.selectedPrice || 0);
  };


  const basePrice = getBasePrice();
  const itemQuantity = item?.quantity || 1;
  const cartItemId = item?.cartItemId;

  const isRunningOrderItem =
    orderType === "dine_in" &&
    activeTableOrder &&
    activeTableOrder.items?.some((orderItem) => orderItem.id === cartItemId);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      handleRemove();
      return;
    }

    const payload = {
      quantity: newQuantity,
      order_type: orderType || "dine_in",
    };

    if (orderType === "dine_in" && tableId) {
      payload.table_id = String(tableId);
    }

    if (cartItemId && navigator.onLine) {
      dispatch(updateCartItem({
        cartItemId,
        res: payload
      }));
    }
  };

  // const handleRemove = (itemID) => {
  //   const payload = {
  //     order_type: orderType || "dine_in",
  //   };

  //   if (orderType === "dine_in" && tableId) {
  //     payload.table_id = tableId;
  //   }
  //   if (cartItemId && navigator.onLine) {
  //     dispatch(removeCartItem({
  //       itemId: cartItemId,
  //       res: payload
  //     }));
  //   }
  // };

  const handleRemove = async () => {
    const payload = {
      order_type: orderType || "dine_in",
    };

    if (orderType === "dine_in" && tableId) {
      payload.table_id = tableId;
    }

    try {
      if (isRunningOrderItem) {
        await dispatch(
          dineRemoveCartItem({
            itemId: cartItemId,
            res: payload,
          })
        ).unwrap();

        await dispatch(loadTableOrders(tableId)).unwrap();
        return;
      }
      // BEFORE order created: remove from cart
      if (cartItemId && navigator.onLine) {
        await dispatch(
          removeCartItem({
            itemId: cartItemId,
            res: payload,
          })
        ).unwrap();
      }
    } catch (error) {
      console.error("Remove item failed:", error);
    }
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
          {formatPrice(item.selectedPrice)}
        </div>
      </div>

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
      {item.instructions && (
        <div className="cartItemAddons mt-2">
          <div className="addon-detail">
            <span>{item.instructions}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItem;