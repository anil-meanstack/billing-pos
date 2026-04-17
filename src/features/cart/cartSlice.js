import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  placeOrderApi,
  getOrdersApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
} from "./cartApi";

export const loadCart = createAsyncThunk(
  "cart/loadCart",
  async (_, { rejectWithValue }) => {
    try {
      return await getOrdersApi();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const placeOrder = createAsyncThunk(
  "cart/placeOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      return await placeOrderApi(orderData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async ({ cartItemId, quantity }, { rejectWithValue }) => {
    try {
      return await updateCartItemApi(cartItemId, quantity);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (itemId, thunkAPI) => {
    try {
      await removeCartItemApi(itemId);
      return itemId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const clearCartServer = createAsyncThunk(
  "cart/clearServer",
  async (_, { rejectWithValue }) => {
    try {
      await clearCartApi();
      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

const initialState = {
  items: [],
  orderType: "dine-in",
  tableNumber: "",
  cartId: null,
  cartData: null,
  cartSummary: {
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    deliveryCharge: 0,
    total_amount: 0,
    itemCount: 0,
    orderType: "dine-in",
    tableNumber: "",
  },
  customerInfo: {
    name: "",
    phone: "",
  },
  pickupTime: "",
  orderNotes: "",

  loading: false,
  error: null,
};
const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    /* Add Item (Local Only) */
    addToCart: (state, action) => {
      const { item, sizeKey, price } = action.payload;

      const existingItem = state.items.find(
        (i) => i.id === item.id && i.size === sizeKey,
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          ...item,
          size: sizeKey,
          selectedPrice: price,
          quantity: 1,
        });
      }
    },

    removeFromCart: (state, action) => {
      const { itemId, sizeKey } = action.payload;

      // state.items = state.items.filter(
      //   (item) => !(item.id === itemId && item.size === sizeKey),
      // );
      state.items = state.items.filter(
        (item) =>
          item.cartItemId !== itemId &&
          item.id !== itemId
      );
    },

    updateQuantity: (state, action) => {
      const { itemId, sizeKey, quantity } = action.payload;

      const item = state.items.find(
        (i) => i.cartItemId === itemId
      )

      if (item) {
        item.quantity = quantity;
      }
    },

    /* Clear Cart */
    clearCart: (state) => {
      state.items = [];
      state.cartId = null;
    },

    setOrderType: (state, action) => {
      state.orderType = action.payload;
    },
    setTableId: (state, action) => {
      state.tableId = action.payload;
    },

    setTableNumber: (state, action) => {
      state.tableNumber = action.payload;
    },

    setCustomerInfo: (state, action) => {
      state.customerInfo = action.payload;
    },

    setPickupTime: (state, action) => {
      state.pickupTime = action.payload;
    },

    setOrderNotes: (state, action) => {
      state.orderNotes = action.payload;
    },

    loadOrderToCart: (state, action) => {
      const order = action.payload;

      if (order?.items && Array.isArray(order.items)) {
        state.items = order.items.map((item) => ({
          id: item.id || "",
          name: item.name || "",
          quantity: Number(item.quantity) || 1,
          selectedPrice: Number(item.price) || 0,
          size: item.size || "",
        }));
      }

      state.tableNumber = order?.tableNumber || "";
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(loadCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loadCart.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload;
        state.cartData = data?.cart || null;
        state.cartId = data?.cart?.id || data?.cart_summary?.cart_id || null;
        const apiOrderType =
          data?.cart?.order_type || data?.cart_summary?.order_type || "";

        let frontendOrderType = "dine-in";
        if (apiOrderType === "takeaway") {
          frontendOrderType = "takeaway";
        } else if (apiOrderType === "delivery") {
          frontendOrderType = "delivery";
        } else if (apiOrderType === "dine_in") {
          frontendOrderType = "dine-in";
        }

        if (!state.orderType && apiOrderType) {
          state.orderType = frontendOrderType;
        }

        // Store cart summary data
        if (data?.cart_summary) {
          state.cartSummary = {
            subtotal: parseFloat(data.cart_summary.subtotal) || 0,
            tax_amount: parseFloat(data.cart_summary.tax_amount) || 0,
            discount_amount: parseFloat(data.cart_summary.discount_amount) || 0,
            delivery_charge: parseFloat(data.cart_summary.delivery_charge) || 0,
            total_amount: parseFloat(data.cart_summary.total_amount) || 0,
            item_count: data.cart_summary.item_count || 0,
            order_type: frontendOrderType,
            table_number: data.cart_summary.table_number || state.tableNumber,
          };
        }

        // Update table number from cart if available
        if (data?.cart?.table_number) {
          state.tableNumber = data.cart.table_number;
        }

        let items = [];

        if (Array.isArray(data)) {
          items = data;
        } else if (Array.isArray(data?.items)) {
          items = data.items;
        } else if (Array.isArray(data?.cart?.items)) {
          items = data.cart.items;
        }

        state.items = [];
        if (items.length) {
          state.items = items.map((item) => {
            // Calculate total addons price
            const addonsTotal = item.addons?.reduce((sum, addon) => {
              return sum + (Number(addon.price) || 0);
            }, 0) || 0;

            // For simple items (no variant)
            const isSimpleItem = !item.variant_id && !item.variant;

            // Get the base price (without addons)
            let basePrice = 0;
            if (isSimpleItem) {
              // Simple item: use unit_price as base (should be without addons)
              basePrice = Number(item.unit_price) || 0;
            } else {
              // Variant item: use variant_price
              basePrice = Number(item.variant_price) || 0;
            }

            // Get the final price (with addons)
            let finalPrice = Number(item.item_total) || 0;

            // If item_total is not provided, calculate it
            if (!finalPrice && basePrice > 0) {
              finalPrice = basePrice + addonsTotal;
            }

            return {
              id: item.cart_item_id,
              cartItemId: item.cart_item_id,
              menu_item_id: item.menu_item_id || "",
              name: item.menu_item_name || item.name || "",
              image: item.menu_item_image || "",
              category: item.menu_item_category || "",
              quantity: Number(item.quantity) || 1,

              // Store base price separately
              basePrice: basePrice,  // ← Add this
              selectedPrice: basePrice,  // ← Use base price here

              variant_id: item.variant_id || "",
              size: item.variant || "",
              sizeName: item.variant_name || "",
              sizePrice: Number(item.variant_price) || 0,
              addons: item.addons || [],

              // Store final price (base + addons)
              finalPrice: finalPrice,  // ← This already includes addons

              instructions: item.special_instructions || item.instructions || "",
              menu_item: item.menu_item || null,
            };
          });
        }
      })
      .addCase(loadCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load cart";
      })

      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
      })

      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;

        const response = action.payload;

        // OFFLINE RESPONSE
        if (response?.offline && response?.items) {
          console.log("📱 Offline order fulfilled:", response.items);

          state.items = response.items.map((item) => ({
            id: item.menu_item_id,
            menu_item_id: item.menu_item_id,
            name: item.menu_item?.name || "Menu Item",
            image: item.menu_item?.image || "",
            category: item.menu_item?.category_name || "",

            quantity: Number(item.quantity) || 1,

            selectedPrice: Number(item.price) || 0,

            // CRITICAL: Store the variant_id
            variant_id: item.variant_id || "",
            size: item.variant_id || "", // Keep for backward compatibility
            sizeName: item.sizeName || "",

            sizePrice: Number(item.price) || 0,

            addons: item.addons || [],

            finalPrice: Number(item.finalPrice || item.price || 0),

            cartItemId: item.menu_item_id,

            // CRITICAL: Store the complete menu_item data
            menu_item: item.menu_item,

            instructions: "",
          }));

          return;
        }

        // ONLINE RESPONSE (keep your existing code)
        if (!response?.cart) return;

        state.cartId = response.cart.id;

        state.items = response.cart.items.map((item) => ({
          id: item.menu_item_id || "",
          name: item.menu_item_name || item.name || "",
          image: item.menu_item_image || "",
          category: item.menu_item_category || "",

          quantity: Number(item.quantity) || 1,

          selectedPrice:
            Number(item.item_total) || Number(item.unit_price) || 0,

          size: item.variant || "",
          variant_id: item.variant || "", // Add variant_id
          sizeName: item.variant_name || "",

          sizePrice: Number(item.variant_price) || 0,

          cartItemId: item.cart_item_id || "",

          addons: item.addons_ids || [],

          instructions: item.special_instructions || "",

          // For online, we might not have menu_item, but that's okay
          menu_item: null,
        }));
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Order failed";
      })

      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
      })

      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload;

        if (data?.offline) {
          const item = state.items.find(
            (i) => i.cartItemId === data.itemId || i.id === data.itemId
          );

          if (item) {
            item.quantity = data.quantity;
          }

          return;
        }

        const item = state.items.find(
          (i) => i.cartItemId === (data.cart_item_id || data.id)
        );

        if (item) {
          item.quantity = data.quantity;
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Update failed";
      })

      .addCase(removeCartItem.pending, (state) => {
        state.loading = true;
      })

      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.loading = false;

        const removedId = action.payload;

        state.items = state.items.filter(
          (item) =>
            item.cartItemId !== removedId &&
            item.id !== removedId
        );
      })

      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Remove failed";
      })

      .addCase(clearCartServer.pending, (state) => {
        state.loading = true;
      })

      .addCase(clearCartServer.fulfilled, (state) => {
        state.loading = false;

        state.items = [];
        state.cartId = null;
        state.cartData = null;
        state.cartSummary = null;
        state.tableNumber = "";
        state.customerInfo = {};
      })

      .addCase(clearCartServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Clear cart failed";
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setOrderType,
  setTableNumber,
  setTableId,
  setCustomerInfo,
  setPickupTime,
  setOrderNotes,
  loadOrderToCart,
} = cartSlice.actions;


export const selectCartTotal = (state) => {
  if (!Array.isArray(state.cart.items)) return 0;

  return state.cart.items.reduce((total, item) => {
    // const itemTotal = Number(item.finalPrice) || 0;
    const itemTotal = (Number(item.finalPrice) || 0) * (Number(item.quantity) || 1);
    return total + itemTotal;
  }, 0);
};

export const selectItemCount = (state) => {
  if (!Array.isArray(state.cart.items)) return 0;

  return state.cart.items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );
};

export default cartSlice.reducer;
