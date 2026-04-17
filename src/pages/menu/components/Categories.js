import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedCategory } from '../../../features/menu/menuSlice';

const Categories = ({ setActiveTab, activeTab }) => {
  const dispatch = useDispatch();
  const { categories, selectedCategory } = useSelector((state) => state.menu);

  const scrollRef = useRef();

  const scroll = (direction) => {
    const amount = 500;

    if (direction === "left") {
      scrollRef.current.scrollBy({ left: -amount, behavior: "smooth" });
    } else {
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };


  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();

      const speed = 4;
      el.scrollLeft += e.deltaY * speed;
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);


  return (
    <div className="categoriesWrapper ">

      {/* LEFT ARROW */}
      <button
        className="scrollBtn left"
        onClick={() => scroll("left")}
      >
        ◀
      </button>

      {/* SCROLL AREA */}
      <div
        className="categoriesContainer"
        ref={scrollRef}
      // onWheel={handleWheel}
      >
        <div className="categoriesScroll">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`categoryButton 
                          ${activeTab === "combo" ? "comboActive" : ""}
                          ${selectedCategory === category.id && activeTab === "menu" ? "active" : ""}
                        `}
              onClick={() => {
                dispatch(setSelectedCategory(category.id));
                if (activeTab !== "menu") {
                  setActiveTab("menu");
                }

              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT ARROW */}
      <button
        className="scrollBtn right"
        onClick={() => scroll("right")}
      >
        ▶
      </button>

    </div>
  );
};

export default Categories;