import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch ,useSelector} from "react-redux";
import { placeOrder, loadCart } from "../../../../features/cart/cartSlice";
import "./Modal.css";
import Alert from "../../../../components/Alert/Alert";

const Modal = ({ show, onClose, item }) => {
  const dispatch = useDispatch();

  const variantGroups = useMemo(() => item?.variants || [], [item?.variants]);
  const addonCategories = useMemo(() => item?.addon_categories || [], [item?.addon_categories]);

  const [selected, setSelected] = useState({
    variants: {},
    addons: {},
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "",
    type: "danger",
  });

  const showError = useCallback((message) => {
    setShowAlert({
      show: true,
      message,
      type: "success",
    });
  }, []);

  useEffect(() => {
    if (!show) return;

    const defaults = {};

    variantGroups.forEach((group) => {
      if (group.variants?.length) {
        const def =
          group.variants.find((v) => v.is_default) ||
          group.variants[0];

        defaults[group.group_id] = def;
      }
    });

    setSelected({
      variants: defaults,
      addons: {},
    });

    setActiveIndex(0);
    setQuantity(1);
  }, [show, variantGroups]);

  const mainVariant = useMemo(() => {
    const first = variantGroups[0];
    if (!first) return null;

    return selected.variants[first.group_id];
  }, [selected, variantGroups]);



  const addonSteps = useMemo(() => {
    // ✅ if no variants → show all addons directly
    if (!item.has_variants) {
      return addonCategories.map((cat) => ({
        ...cat,
        type: "addon",
      }));
    }

    // ✅ if variants → filter by variant
    if (!mainVariant) return [];

    const normalize = (str) => str?.toLowerCase().replace(/\s+/g, "").trim();
    const selectedVariantName = normalize(mainVariant.name);

    // Find matching addon category
    let matchingCategory = addonCategories.find((cat) =>
      normalize(cat.name) === selectedVariantName
    );

    if (!matchingCategory && addonCategories.length > 0) {
      // Option 1: Show all addons as fallback
      return addonCategories.map((cat) => ({
        ...cat,
        type: "addon",
      }));


    }

    return matchingCategory ? [{
      ...matchingCategory,
      type: "addon",
    }] : [];
  }, [mainVariant, addonCategories, item.has_variants]);

  const steps = useMemo(() => {
    if (!item.has_variants) {
      return addonSteps; // directly addons
    }
    return [
      ...variantGroups.map((g) => ({
        ...g,
        type: "variant",
      })),
      ...addonSteps,
    ];
  }, [variantGroups, addonSteps, item.has_variants]);

  const nextStep = steps[activeIndex + 1];
  const activeStep = steps[activeIndex];

  const handleSelect = (step, option) => {
    if (step.type === "variant") {
      setSelected((prev) => ({
        ...prev,
        variants: {
          ...prev.variants,
          [step.group_id]: option,
        },
        addons: {},
      }));

      // ✅ Check if next step exists before moving
      setTimeout(() => {
        if (activeIndex < steps.length - 1 && steps[activeIndex + 1]) {
          setActiveIndex((prev) => prev + 1);
        }
      }, 120);
    }

    if (step.type === "addon") {
      const current = selected.addons[step.id] || [];
      const max = step.max_selections;
      const min = step.min_selections || 0;

      let updated = [];

      if (current.includes(Number(option.id))) {
        updated = current.filter((id) => id !== Number(option.id));
      } else {
        if (max && current.length >= max) {
          showError(`You can select only ${max} items`);
          return;
        }
        updated = [...current, Number(option.id)];
      }
      setSelected((prev) => ({
        ...prev,
        addons: {
          ...prev.addons,
          [step.id]: updated,
        },
      }));

      const shouldMove =
        (max && updated.length >= max) ||
        (!max && updated.length >= min && min > 0);

      if (shouldMove) {
        setTimeout(() => {
          if (activeIndex < steps.length - 1 && steps[activeIndex + 1]) {
            setActiveIndex((prev) => prev + 1);
          }
        }, 120);
      }
    }
  };

  
  const totalPrice = useMemo(() => {
    let total = 0;

    if (item.has_variants) {
      // For items with variants, use variant price_modifier (no base_price)
      Object.values(selected.variants).forEach((v) => {
        total += Number(v.price_modifier || 0);
      });
    } else {
      // For simple items without variants, use base_price
      total += Number(item.base_price || 0);
    }

    // Add addons
    Object.entries(selected.addons).forEach(([catId, ids]) => {
      const cat = addonCategories.find(
        (c) => String(c.id) === String(catId)
      );

      const uniqueIds = [...new Set(ids)];

      uniqueIds.forEach((id) => {
        const addon = cat?.addons.find(
          (a) => String(a.id) === String(id)
        );

        if (addon) {
          total += Number(addon.price || 0);
        }
      });
    });

    return total * quantity;
  }, [selected, quantity, item, addonCategories]);

 

  const preparePayload = () => {
    const first = variantGroups[0];

    if (!item.has_variants) {
      return {
        menu_item_id: item.id,
        quantity,
        variant_id: null,
        addon_ids: Object.values(selected.addons).flat(),
      };
    }

    return {
      menu_item_id: item.id,
      quantity,
      variant_id: first ? selected.variants[first.group_id]?.id : null,
      addon_ids: Object.values(selected.addons).flat(),
    };
  };

  const handleAddToCart = async () => {
    try {
      await dispatch(placeOrder(preparePayload())).unwrap();
      dispatch(loadCart());
      onClose();
    } catch {
      alert("Error");
    }
  };

  if (!show || !item) return null;

  const maxSelections =
    activeStep?.type === "addon"
      ? activeStep.max_selections
      : activeStep?.max_selections || 1;

  const currentCount =
    activeStep?.type === "addon"
      ? (selected.addons[activeStep.id] || []).length
      : selected.variants[activeStep.group_id]
        ? 1
        : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="modal-header">
          <div>
            <span className="modal-category-badge">
              {item.category_name}
            </span>
            <h2 className="modal-title">{item.name}</h2>
            <p className="modal-description">{item.description || "Customize your order"}</p>
          </div>
          <div className="product-img-box">
            <img src={item.image} alt={item.name} />
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-nav">
          <div className="modal-nav-container">
            {steps.map((step, index) => (
              <button
                key={index}
                className={`modal-nav-item ${activeIndex === index ? "active" : ""
                  }`}
                onClick={() => setActiveIndex(index)}
              >
                {step.group_name || step.name}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-body">
          {activeStep && (
            <div className="modal-category">
              <div className="modal-category-header">
                <h3 className="modal-category-title">
                  {activeStep.group_name || activeStep.name}
                </h3>
                {maxSelections > 1 && (
                  <span className="modal-category-limit">
                    Select up to {maxSelections} • {currentCount}/{maxSelections}
                  </span>
                )}
              </div>

              <div className="modal-options-list">
                {(activeStep.variants || activeStep.addons).map((opt) => {
                  const isSelected =
                    activeStep.type === "variant"
                      ? selected.variants[activeStep.group_id]?.id === opt.id
                      : (selected.addons[activeStep.id] || []).includes(Number(opt.id));

                  return (
                    <div
                      key={opt.id}
                      className="modal-option"
                      onClick={() => handleSelect(activeStep, opt)}
                    >
                      <div className="modal-option-content">
                        <div className="modal-option-info">
                          <div className="modal-option-name">{opt.name}</div>
                          <div className="modal-option-price paid">
                            ₹{opt.price_modifier || opt.price}
                          </div>
                        </div>

                        <div className={`modal-checkbox ${isSelected ? "selected" : ""}`}>
                          {isSelected && "✓"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeIndex < steps.length - 1 && (
                <div className="modal-category-footer">
                  <button
                    className="modal-category-next"
                    onClick={() => setActiveIndex((prev) => prev + 1)}
                  >
                    Next: {nextStep?.group_name || nextStep?.name} →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* QUANTITY */}
        <div className="modal-quantity">
          <span className="modal-quantity-label">Quantity</span>
          <div className="modal-quantity-controls">
            <button className="modal-quantity-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
            <span className="modal-quantity-value">{quantity}</span>
            <button className="modal-quantity-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button className="modal-button modal-button-secondary" onClick={onClose}>Cancel</button>
          <button className="modal-button modal-button-primary" onClick={handleAddToCart}>
            Add to Cart • ₹{totalPrice.toFixed(2)}
          </button>
        </div>

      </div>
      <Alert
        show={showAlert.show}
        message={showAlert.message}
        type={showAlert.type}
        onClose={() => setShowAlert({ ...showAlert, show: false })}
      />
    </div>
  );
};

export default Modal;