import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { fetchMenuData } from "../../features/menu/menuSlice";
import { addToCart, loadOrderToCart, loadCart, placeOrder } from "../../features/cart/cartSlice";
import { loadTablesFromApi } from "../../features/table/tableSlice"
import { fetchOrderHistory } from "../../features/orders/ordersSlice";
import Categories from "./components/Categories";
import SearchBar from "./components/SearchBar";
import MenuItem from "./components/MenuItem";
import Modal from "./components/Modal/Modal";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import ErrorMessage from "../../components/UI/ErrorMessage";
import CartSummary from "../../components/Cart/CartSummary";
import "../../style/MenuPage.css";

const ItemGrid = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { items, selectedCategory, searchTerm, error, loading, filters  } = useSelector(
    (state) => state.menu
  );

  // const { table, orderId } = location.state || {};
  const { table, tableId, tableNumber, orderType, orderId } = location.state || {};

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    dispatch(fetchMenuData());
    dispatch(loadCart());

  }, [dispatch]);

  useEffect(() => {

    dispatch(fetchOrderHistory());
    dispatch(loadTablesFromApi())

  }, [dispatch]);

  useEffect(() => {
    if (orderId && table?.id) {
      const orders = JSON.parse(
        localStorage.getItem("restaurantOrders") || "[]"
      );

      const existingOrder = orders.find(
        (o) =>
          o.orderNumber === orderId &&
          Number(o.tableId) === Number(table.id)
      );

      if (existingOrder) {
        dispatch(loadOrderToCart(existingOrder));
      }
    }
  }, [orderId, table, dispatch]);

  const getAuthData = () => {
    const data = localStorage.getItem("user");

    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };


  const getRestaurantName = () => {
    const auth = getAuthData();

    return (
      auth?.currentRestaurant?.name ||
      auth?.restaurant?.name ||
      "Restaurant"
    );
  };


  const getRestaurantId = () => {
    const auth = getAuthData();

    return (
      auth?.currentRestaurant?.id ||
      auth?.restaurant?.id ||
      null
    );
  };

  // const filteredItems = items.filter((item) => {
  //   const matchesCategory =
  //     selectedCategory === "all" || item.category === selectedCategory;

  //   const matchesSearch =
  //     item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     item.description?.toLowerCase().includes(searchTerm.toLowerCase());

  //   return matchesCategory && matchesSearch;
  // });
  const filteredItems = items
    .filter((item) => {
      // ✅ Category
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      // ✅ Search
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase());

      // ✅ Food Type (MULTI SELECT)
      const matchesFoodType =
        filters.foodTypes.length === 0 ||
        filters.foodTypes.includes(item.food_type?.toLowerCase());

      return matchesCategory && matchesSearch && matchesFoodType;
    })
    .sort((a, b) => {
      const priceA = Number(a.base_price || a.min_price || 0);
      const priceB = Number(b.base_price || b.min_price || 0);

      if (filters.sortBy === "low-high") {
        return priceA - priceB;
      } else if (filters.sortBy === "high-low") {
        return priceB - priceA;
      }
      return 0;
    });


  const handleAddToCart = async (item, sizeKey) => {
    try {
      const restaurantId = getRestaurantId();

      if (!restaurantId) {
        alert("Restaurant ID not found. Please login again.");
        return;
      }
      const payload = {
        menu_item_id: item.id,
        quantity: 1,
      };

      if (item?.variants?.length > 0) {
        const defaultVariant =
          item.variants[0]?.variants?.find(v => v.is_default) ||
          item.variants[0]?.variants?.[0];

        if (defaultVariant) {
          payload.variant_id = defaultVariant.id;
        }
      }
      await dispatch(placeOrder(payload)).unwrap();

      dispatch(loadCart());

    } catch (error) {
      console.error("Add To Cart Error:", error);
      dispatch(
        addToCart({
          item,
          sizeKey: sizeKey || "regular",
          price: item.base_price || item.min_price || 0,
        })
      );
    }
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };


  if (loading) return <LoadingSpinner text="Loading Menu..." />;

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => dispatch(fetchMenuData())}
      />
    );
  }

  return (
    <div className="container-fluid m-sec">
      <div className="mainContent">

        <div className="menuSection">

          <SearchBar />
          <Categories />

          <div className="menuGrid">
            {filteredItems.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
                onItemClick={openModal}
              />
            ))}
          </div>

        </div>

        <div className="orderSection">
          {/* <CartSummary table={table?.id || null} /> */}
          <CartSummary
            tableId={tableId}
            tableNumber={tableNumber}
            orderType={orderType}
          />
        </div>

      </div>

      {showModal && selectedItem && (
        <Modal
          show={showModal}
          item={selectedItem}
          onAddToCart={handleAddToCart}
          onClose={closeModal}
          restaurantName={getRestaurantName()}
        />
      )}
    </div>
  );
};

export default ItemGrid;