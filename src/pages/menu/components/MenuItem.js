import { useSelector } from "react-redux";

const MenuItem = ({ item, onAddToCart, onItemClick }) => {
  const cartItems = useSelector((state) => state.cart.items);

  const getItemCount = () => {
    return cartItems
      ?.filter(cartItem => cartItem.id === item.id)
      ?.reduce((total, curr) => total + curr.quantity, 0);
  };
  const itemCount = getItemCount();

  const getStartingPrice = () => {
    return item.has_variants
      ? item.min_price
      : item.base_price;
  };

  const getMaxPrice = () => {
    return item.has_variants
      ? item.max_price
      : item.base_price;
  };



  const formatPrice = (price) => `₹${Number(price || 0).toLocaleString("en-IN")}`;

  const hasCustomization = item.has_variants || item.has_addons;

  const handleClick = () => {
    if (hasCustomization) {
      onItemClick(item);
    } else {
      onAddToCart(item, null);
    }
  };

  return (
    <div className="menuItemCard" onClick={handleClick}>
      {itemCount > 0 && (
        <div className="cartBadge">
          {itemCount}
        </div>
      )}
      <div className="itemImageContainer mb-1 d-flex justify-content-between">
        <img src={item.image} alt={item.name} className="itemImage" />

        <div className="itemTags">
          {item.spicy && <span className="spicyTag">Spicy</span>}
          {item.food_type === "veg" && (
            <span className="vegTag">Veg</span>
          )}

          {item.food_type === "non_veg" && (
            <span className="nonVegTag">Non-Veg</span>
          )}
        </div>
      </div>

      <div className="itemContent">
        <div className="itemHeader">
          <h3 className="itemName">{item.name}</h3>
        </div>

        <p className="itemDescription">{item.description}</p>

        <div className="d-flex justify-content-between">
          <div className="itemPrice">
            {getStartingPrice() === getMaxPrice() ? (
              <span>{formatPrice(getStartingPrice())}</span>
            ) : (
              <span>
                {formatPrice(getStartingPrice())} - {formatPrice(getMaxPrice())}
              </span>
            )}
          </div>
          <div className="plusIcon">
            {hasCustomization ? (
              <span >✦</span>
            ) : (
              <i className="bi bi-plus-lg"></i>
            )}
          </div>
        </div>

        {!item.is_available && (
          <div className="unavailableBadge">Unavailable</div>
        )}
      </div>


    </div>

  );
};

export default MenuItem;

