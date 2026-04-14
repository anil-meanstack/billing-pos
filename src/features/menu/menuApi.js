// const API_BASE_URL =
//   process.env.NODE_ENV === "production"
//     ? process.env.REACT_APP_API_BASE_URL
//     : "/api";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const getAuthData = () => {
  const userData = localStorage.getItem("user");

  if (!userData) return null;

  try {
    return JSON.parse(userData);
  } catch (err) {
    return null;
  }
};

const getRestaurantSlug = () => {
  const auth = getAuthData();

  if (!auth) return null;

  return (
    auth?.currentRestaurant?.id ||
    auth?.restaurant?.id ||
    null
  );
};
const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;
  return [];
};

const findCategory = (categories, itemCategory) => {
  return categories.find(cat =>
    cat.id === itemCategory ||
    cat.slug === itemCategory?.toString()
  );
};


const formatAddonCategories = (addonCategories) => {
  return addonCategories?.map(cat => ({
    id: cat.id,
    name: cat.name,
    is_required: cat.is_required,
    min_selections: cat.min_selections,
    max_selections: cat.max_selections,
    addons: cat.addons?.map(addon => ({
      id: addon.id,
      name: addon.name,
      name_display: `${addon.name} (+₹${addon.price})`,
      price: parseFloat(addon.price) || 0,
      description: addon.description || '',
      is_available: true,
      category_id: cat.id,
      category_name: cat.name,
    })) || []
  })) || [];
};

const getCategorySlug = (categoryObj, itemCategory) => {
  if (categoryObj?.slug) return categoryObj.slug;
  if (categoryObj?.id) return categoryObj.id.toString();
  if (itemCategory?.name) return itemCategory.name.toLowerCase().replace(/\s+/g, '-');
  return itemCategory?.toString() || 'uncategorized';
};


export const menuApi = {
  fetchMenuData: async () => {
    try {
      const slug = getRestaurantSlug();

      const [categoriesRes, menuRes] = await Promise.all([
        fetch(`${API_BASE_URL}/public/categories/?restaurant=${slug}`),
        fetch(`${API_BASE_URL}/public/menu-items/?restaurant_id=${slug}`)
      ]);

      if (!categoriesRes.ok || !menuRes.ok) {
        throw new Error("API failed");
      }

      const categoriesJson = await categoriesRes.json();
      const menuJson = await menuRes.json();

      const categories = categoriesJson.results || categoriesJson;
      const menu = menuJson.results || menuJson;


      return transformData(categories, menu);

    } catch (error) {



      return getFallbackData();
    }
  }
//   fetchMenuData: async () => {
//   try {
//     const slug = getRestaurantSlug();

//     // ✅ OFFLINE MODE
//     if (!navigator.onLine && window.electronAPI) {
//       console.log("Offline → loading from SQLite");

//       const local = await window.electronAPI.getMenu();

//       if (local.menu.length > 0) {
//         return {
//           restaurant_name: "Offline Restaurant",
//           categories: local.categories,
//           items: local.menu,
//         };
//       }
//     }

//     // ✅ ONLINE MODE
//     const [categoriesRes, menuRes] = await Promise.all([
//       fetch(`${API_BASE_URL}/public/categories/?restaurant=${slug}`),
//       fetch(`${API_BASE_URL}/public/menu-items/?restaurant_id=${slug}`)
//     ]);

//     if (!categoriesRes.ok || !menuRes.ok) {
//       throw new Error("API failed");
//     }

//     const categoriesJson = await categoriesRes.json();
//     const menuJson = await menuRes.json();

//     const categories = categoriesJson.results || categoriesJson;
//     const menu = menuJson.results || menuJson;

//     const transformed = transformData(categories, menu);

//     // ✅ SAVE TO SQLITE
//     if (window.electronAPI) {
//       await window.electronAPI.saveMenu(
//         transformed.categories,
//         transformed.items
//       );
//     }

//     return transformed;

//   } catch (error) {
//     console.log("API failed → fallback to SQLite");

//     if (window.electronAPI) {
//       const local = await window.electronAPI.getMenu();

//       if (local.menu.length > 0) {
//         return {
//           restaurant_name: "Offline Restaurant",
//           categories: local.categories,
//           items: local.menu,
//         };
//       }
//     }

//     return getFallbackData();
//   }
// }
};
const transformData = (categoriesData, menuData) => {
  const categories = extractArray(categoriesData);
  const menuItems = extractArray(menuData);

  const getRestaurantName = () => {
    if (menuItems && menuItems.length > 0) {
      const firstItem = menuItems[0];
      return firstItem.restaurant_name || 'Restaurant Name';
    }
    return 'Restaurant Name';
  };

  const restaurantName = getRestaurantName();


  const transformedCategories = categories.map(cat => ({
    id: cat.slug || cat.id?.toString(),
    name: cat.name || 'Unnamed Category',
    slug: cat.slug || cat.id?.toString(),
  }));

  const transformedItems = menuItems.map(item => {
    const category = findCategory(categories, item.category);

    return {
      id: item.id,
      name: item.name || "Unnamed Item",
      description: item.description || "",
      image: item.image,
      restaurant_name: item.restaurant_name || restaurantName,

      // ✅ USE API PRICES DIRECTLY
      base_price: Number(item.base_price) || 0,
      min_price: Number(item.min_price) || 0,
      max_price: Number(item.max_price) || 0,

      // Category
      category: getCategorySlug(category, item.category),
      category_id: item.category,
      category_name: category?.name || item.category_name || "Uncategorized",

      // Properties
      popular: item.popular || false,
      spicy: item.spicy || false,
      vegetarian: item.vegetarian !== false,
      is_available: item.is_available !== false,

      // Variants & Addons (AS-IS)
      food_type: item.food_type || (item.vegetarian ? "veg" : "non_veg"),
      variants: item.variants || [],
      addon_categories: item.addon_categories || [],
      has_variants: item.has_variants || false,
      has_addons: item.has_addons || false,
    };
  });

  return {
    restaurant_name: restaurantName,
    categories: transformedCategories,
    items: transformedItems,
  };
};

const getFallbackData = () => ({
  categories: [
    { id: 'pizza', name: 'Pizza', slug: 'pizza' },
    { id: 'burger', name: 'Burger', slug: 'burger' },
  ],
  items: [
    {
      id: 1,
      name: 'Margherita Pizza',
      description: 'Classic tomato sauce, fresh mozzarella, basil',
      restaurant_name: 'Test Restaurant',
      price: { regular: 650, medium: 750, large: 850 },
      category: 'pizza',
      category_id: 'pizza',
      category_name: 'Pizza',
      image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop',
      popular: true,
      spicy: false,
      vegetarian: true,
      is_available: true,
      preparation_time: 20,
      addon_categories: [],
      variants: [],
      has_addons: false,
      has_variants: false,
      calories: {},
      currency: "INR",
    },
  ],
});