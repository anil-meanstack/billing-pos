// import React from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { setSelectedCategory } from '../../../features/menu/menuSlice';

// const Categories = () => {
//   const dispatch = useDispatch();
//   const { categories, selectedCategory } = useSelector((state) => state.menu);

//   return (
//     <div className="categoriesContainer">
//       <div className="categoriesScroll">
//         {categories.map((category) => (
//           <button
//             key={category.id}
//             className={`categoryButton ${
//               selectedCategory === category.id ? 'active' : ''
//             }`}
//             onClick={() => dispatch(setSelectedCategory(category.id))}
//           >
//             {category.name}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Categories;


import React, { useRef,useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedCategory } from '../../../features/menu/menuSlice';

const Categories = () => {
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

  // const handleWheel = (e) => {
  //   e.preventDefault();
  //   scrollRef.current.scrollLeft += e.deltaY;
  // };
useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
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
              className={`categoryButton ${
                selectedCategory === category.id ? 'active' : ''
              }`}
              onClick={() => dispatch(setSelectedCategory(category.id))}
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