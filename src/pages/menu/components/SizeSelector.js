import React from 'react';

const SizeSelector = ({ item, onAddToCart, getItemQuantity }) => {
  const getAvailableSizes = () => {
    if (!item.price) return [];

    const sizes = [];
    const priceKeys = Object.keys(item.price);

    priceKeys.forEach((key) => {
      switch (key.toLowerCase()) {
        case 'regular':
          sizes.push({ key: 'regular', label: 'R', display: 'Regular' });
          break;
        case 'medium':
          sizes.push({ key: 'medium', label: 'M', display: 'Medium' });
          break;
        case 'large':
          sizes.push({ key: 'large', label: 'L', display: 'Large' });
          break;
        case 'meal':
          sizes.push({ key: 'meal', label: 'M', display: 'Meal' });
          break;
        case 'small':
          sizes.push({ key: 'small', label: 'S', display: 'Small' });
          break;
        default:
          const label = key.charAt(0).toUpperCase();
          sizes.push({
            key: key,
            label: label,
            display: key.charAt(0).toUpperCase() + key.slice(1),
          });
          break;
      }
    });

    return sizes;
  };

  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const availableSizes = getAvailableSizes();

  return (
    <div className="sizeButtonsContainer mt-2">
      <div className="sizeButtons">
        {availableSizes.map((size) => {
          const quantity = getItemQuantity(size.key);
          const sizePrice = item.price[size.key] || item.price.regular;

          return (
            <div key={size.key} className="sizeButtonWrapper">
              <button
                className={`sizeButton ${quantity > 0 ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(item, size.key);
                }}
                disabled={!item.is_available}
              >
                <div className="sizeLabel">{size.display}</div>
                <div className="sizePrice">{formatPrice(sizePrice)}</div>
                {quantity > 0 && (
                  <div className="sizeQuantityBadge">{quantity}</div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SizeSelector;