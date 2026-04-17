import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchTerm, setFoodType, setSortBy, setSelectedCategory } from '../../../features/menu/menuSlice';
import AddItemModal from './Modal/AddItemModal';
import { addToCart } from "../../../features/cart/cartSlice";

const SearchBar = ({ setActiveTab, activeTab }) => {
  const dispatch = useDispatch();
  const { searchTerm, filters } = useSelector((state) => state.menu);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);


  const styeBtn = {
    padding: "8px 14px",
    borderRadius: "12px",
    border: "1px solid rgb(0 0 0 / 13%)",
    background: "#fff",
    fontSize: "12px",
    color: "#68665c",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, .05)",
    whiteSpace: "nowrap"
  };


  const handleSaveItem = (item) => {
    dispatch(
      addToCart({
        item: {
          id: Date.now(),
          name: item.name,
          price: item.price,
        },
        sizeKey: "regular",
        price: item.price,
      })
    );
  };

  return (
    <div className="searchContainer" style={{ position: "relative" }}>

      <input
        type="text"
        placeholder="Search menu items..."
        value={searchTerm}
        onChange={(e) => dispatch(setSearchTerm(e.target.value))}
        className="searchInput"
      />

      <button style={styeBtn} onClick={() => setShowFilter(!showFilter)}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2 4h12M5 8h6M7 12h2"></path>
        </svg>
        Filter
      </button>

      <button style={styeBtn} onClick={() => setShowModal(true)}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="8" cy="8" r="5.5"></circle>
          <path d="M8 5.5v5M5.5 8h5"></path>
        </svg>
        Open Item
      </button>
     
      <button
        style={{
          ...styeBtn,
          background: activeTab === "combo" ? "#e05c20" : "#fff",
          color: activeTab === "combo" ? "#fff" : "#68665c",
        }}
        onClick={() => {
          const next = activeTab === "combo" ? "menu" : "combo";

          setActiveTab(next);

          if (next === "combo") {
            dispatch(setSelectedCategory("all"));
          }
        }}
      >
         <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="8" cy="8" r="5.5"></circle>
          <path d="M8 5.5v5M5.5 8h5"></path>
        </svg>
        Combos & Meals
      </button>

      {showFilter && (
        <div style={{
          position: "absolute",
          top: "40px",
          right: "0",
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: "10px",
          padding: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          zIndex: 10,
          width: "220px"
        }}>

          <div>
            <strong style={{ fontSize: "10px" }}>Food Type</strong>

            <label style={{ display: "block", marginTop: "6px", fontSize: "12px" }}>
              <input
                type="checkbox"
                checked={filters.foodTypes.includes('veg')}
                onChange={() => {
                  const updated = filters.foodTypes.includes('veg')
                    ? filters.foodTypes.filter(t => t !== 'veg')
                    : [...filters.foodTypes, 'veg'];

                  dispatch(setFoodType(updated));
                }}
              /> Veg
            </label>

            <label style={{ display: "block", fontSize: "12px" }}>
              <input
                type="checkbox"
                checked={filters.foodTypes.includes('non-veg')}
                onChange={() => {
                  const updated = filters.foodTypes.includes('non-veg')
                    ? filters.foodTypes.filter(t => t !== 'non-veg')
                    : [...filters.foodTypes, 'non-veg'];

                  dispatch(setFoodType(updated));
                }}
              /> Non Veg
            </label>
          </div>

          <div style={{ marginTop: "10px", fontSize: "10px" }}>
            <strong>Sort By Price</strong>

            <label style={{ display: "block", marginTop: "6px" }}>
              <input
                type="radio"
                name="sort"
                checked={filters.sortBy === 'low-high'}
                onChange={() => dispatch(setSortBy('low-high'))}
              /> Low → High
            </label>

            <label style={{ display: "block" }}>
              <input
                type="radio"
                name="sort"
                checked={filters.sortBy === 'high-low'}
                onChange={() => dispatch(setSortBy('high-low'))}
              /> High → Low
            </label>
          </div>

          <div style={{ marginTop: "12px" }}>
            <button
              style={{
                width: "100%",
                borderRadius: "8px",
                border: "1px solid #ccc",
                background: "#f5f5f5",
                fontSize: "12px",
                height: "26px"
              }}
              onClick={() => {
                dispatch(setFoodType([]));
                dispatch(setSortBy(""));
              }}
            >
              Clear Filters
            </button>
          </div>

        </div>
      )}
      <AddItemModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveItem}
      />
    </div>

  );
};

export default SearchBar;