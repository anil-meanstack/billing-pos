import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addToCartItem,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
  tableSelectable,
  addComboApi,
  getCartApi
} from "./cartApi";


export const placeOrder = createAsyncThunk(
  "cart/placeOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      return await addToCartItem(orderData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateTable = createAsyncThunk(
  "cart/updateTable",
  async (payload, { rejectWithValue }) => {
    try {
      return await tableSelectable(payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async ({ cartItemId, res }, { rejectWithValue }) => {
    try {
       await updateCartItemApi(cartItemId, res);
       const cart = await getCartApi(res);
        return cart;

    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async ({ itemId, res }, thunkAPI) => {
    try {
      await removeCartItemApi(itemId, res);
      const updatedCart = await getCartApi(res);
      return updatedCart;
      // return itemId;
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

export const addCombo = createAsyncThunk(
  "cart/addCombo",
  async (payload, { rejectWithValue }) => {
    try {
      return await addComboApi(payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
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
      const { itemId } = action.payload;

      state.items = state.items.filter(
        (item) =>
          item.cartItemId !== itemId &&
          item.id !== itemId
      );
    },

    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;

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

      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
      })

      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;

        const response = action.payload;

        if (!response?.cart) return;

        state.cartId = response.cart.id;
        state.cartData = response.cart;

        state.items = response.cart.items.map((item) => ({
          
          id: item.menu_item_id || "",
          name: item.menu_item_name || item.name || "",
          image: item.menu_item_image || "",
          category: item.menu_item_category || "",
          quantity: Number(item.quantity) || 1,
          base_price:Number(item.unit_price) || Number(item.base_price) || 0,
          selectedPrice:
            Number(item.item_total) || 0,
          size: item.variant || "",
          variant_id: item.variant || "",
          sizeName: item.variant_name || "",
          sizePrice: Number(item.variant_price) || 0,
          cartItemId: item.cart_item_id || "",
          addons: item.addons || [],
          instructions: item.special_instructions || "",
          menu_item: null,
        }));

        state.cartSummary = {
          subtotal: Number(response.cart.subtotal),
          taxAmount: Number(response.cart.tax_amount),
          discountAmount: Number(response.cart.discount_amount),
          deliveryCharge: Number(response.cart.delivery_charge),
          total_amount: Number(response.cart.total_amount),
          itemCount: response.cart.item_count,
          orderType: response.cart.order_type,
          tableNumber: response.cart.table_number,
        };

        state.orderType = response.cart.order_type;
        state.tableNumber = response.cart.table_number;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Order failed";
      })

      .addCase(updateTable.fulfilled, (state, action) => {
        const res = action.payload;

        if (!res?.cart) return;

        const cart = res.cart;

        state.cartId = cart.id;
        state.cartData = cart;

        state.items = cart.items.map((item) => ({
          id: item.menu_item_id || "",
          name: item.menu_item_name || item.name || "",
          image: item.menu_item_image || "",
          category: item.menu_item_category || "",
          quantity: Number(item.quantity) || 1,
          base_price:Number(item.unit_price) || Number(item.base_price) || 0,
          selectedPrice: Number(item.item_total) || 0,
          size: item.variant || "",
          variant_id: item.variant || "",
          sizeName: item.variant_name || "",
          sizePrice: Number(item.variant_price) || 0,
          cartItemId: item.cart_item_id || "",
          addons: item.addons || [],
          instructions: item.special_instructions || "",
          menu_item: null,
        }));

        state.cartSummary = {
          subtotal: Number(cart.subtotal),
          taxAmount: Number(cart.tax_amount),
          discountAmount: Number(cart.discount_amount),
          deliveryCharge: Number(cart.delivery_charge),
          total_amount: Number(cart.total_amount),
          itemCount: cart.item_count,
          orderType: cart.order_type,
          tableNumber: cart.table_number,
        };

        state.orderType = cart.order_type;
        state.tableNumber = cart.table_number;
      })

      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
      })

      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;

        const res = action.payload;

        if (!res?.cart) return;

        const cart = res.cart;

        state.cartId = cart.id;
        state.cartData = cart;

        state.items = cart.items.map((item) => ({
          id: item.menu_item_id || "",
          name: item.menu_item_name || item.name || "",
          quantity: Number(item.quantity) || 1,
           base_price:Number(item.unit_price) || Number(item.base_price) || 0,
          selectedPrice:
            Number(item.item_total) || 0,

          size: item.variant || "",
          variant_id: item.variant || "",
          sizeName: item.variant_name || "",
          sizePrice: Number(item.variant_price) || 0,

          cartItemId: item.cart_item_id || "",
          addons: item.addons || [],
          instructions: item.special_instructions || "",

          isCombo: item.is_combo || false,
          comboDetails: item.combo_details || null,
        }));

        state.cartSummary = {
          subtotal: Number(cart.subtotal),
          taxAmount: Number(cart.tax_amount),
          discountAmount: Number(cart.discount_amount),
          deliveryCharge: Number(cart.delivery_charge),
          total_amount: Number(cart.total_amount),
          itemCount: cart.item_count,
          orderType: cart.order_type,
          tableNumber: cart.table_number,
        };

        state.orderType = cart.order_type;
        state.tableNumber = cart.table_number;
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

  const res = action.payload;

  if (!res?.cart) return;

  const cart = res.cart;

  state.cartId = cart.id;
  state.cartData = cart;

  state.items = cart.items.map((item) => ({
    id: item.menu_item_id || "",
    name: item.menu_item_name || item.name || "",
    quantity: Number(item.quantity) || 1,
    selectedPrice:
      Number(item.unit_price) || 0,

    size: item.variant || "",
    variant_id: item.variant || "",
    sizeName: item.variant_name || "",
    sizePrice: Number(item.variant_price) || 0,

    cartItemId: item.cart_item_id || "",
    addons: item.addons || [],
    instructions: item.special_instructions || "",

    isCombo: item.is_combo || false,
    comboDetails: item.combo_details || null,
  }));

  state.cartSummary = {
    subtotal: Number(cart.subtotal),
    taxAmount: Number(cart.tax_amount),
    discountAmount: Number(cart.discount_amount),
    deliveryCharge: Number(cart.delivery_charge),
    total_amount: Number(cart.total_amount),
    itemCount: cart.item_count,
    orderType: cart.order_type,
    tableNumber: cart.table_number,
  };

  state.orderType = cart.order_type;
  state.tableNumber = cart.table_number;
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
      })

      .addCase(addCombo.pending, (state) => {
        state.loading = true;
      })

      .addCase(addCombo.fulfilled, (state, action) => {
        state.loading = false;

        const res = action.payload;

        if (!res?.cart) return;

        const cart = res.cart;

        // ✅ SAME AS placeOrder / updateTable
        state.cartId = cart.id;
        state.cartData = cart;

        state.items = cart.items.map((item) => ({
          id: item.menu_item_id || "",
          name: item.name || "",
          quantity: Number(item.quantity) || 1,
           base_price:Number(item.unit_price) || Number(item.base_price) || 0,
          selectedPrice:
            Number(item.unit_price) || 0,

          size: item.variant || "",
          variant_id: item.variant || "",
          sizeName: item.variant_name || "",
          sizePrice: Number(item.variant_price) || 0,

          cartItemId: item.cart_item_id || "",
          addons: item.addons || [],
          instructions: item.special_instructions || "",

          isCombo: item.is_combo || false,
          comboDetails: item.combo_details || null,
        }));

        state.cartSummary = {
          subtotal: Number(cart.subtotal),
          taxAmount: Number(cart.tax_amount),
          discountAmount: Number(cart.discount_amount),
          deliveryCharge: Number(cart.delivery_charge),
          total_amount: Number(cart.total_amount),
          itemCount: cart.item_count,
          orderType: cart.order_type,
          tableNumber: cart.table_number,
        };

        state.orderType = cart.order_type;
        state.tableNumber = cart.table_number;
      })

      .addCase(addCombo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Add combo failed";
      })
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
