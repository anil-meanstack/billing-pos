import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/cartSlice';
import menuReducer from '../features/menu/menuSlice';
import ordersReducer from '../features/orders/ordersSlice';
import tableReducer from "../features/table/tableSlice";
import authReducer from "../features/auth/authSlice";
import kitchenReducer  from "../features/kitchen/kitchenSlice"
import staffReducer from "../features/staff/staffSlice"

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    menu: menuReducer,
    orders: ordersReducer,
    tables: tableReducer,
    auth: authReducer,
    kitchen:kitchenReducer ,
    staff: staffReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['cart/addToCart'],
        ignoredPaths: ['cart.items'],
      },
    }),
});