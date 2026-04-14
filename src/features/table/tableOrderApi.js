// import { viewOrder } from "../orders/ordersApi";

// const API_BASE_URL =
//   process.env.NODE_ENV === "production"
//     ? process.env.REACT_APP_API_BASE_URL
//     : "/api";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL



const getAuthData = () => {
  const data = localStorage.getItem("user");
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Invalid user data in localStorage");
    return null;
  }
};
const getRestaurantId = () => {
  const auth = getAuthData();

  return auth?.currentRestaurant?.id || auth?.restaurant?.id || null;
};
const getToken = () => {
  const auth = getAuthData();
  return auth?.accessToken || null;
};
// export const fetchTableOrdersApi = async (tableId) => {
//   try {
//     const token = getToken();
//     const restaurantId = getRestaurantId();
//     const tableResponse = await fetch(
//       `${API_BASE_URL}/tables/${tableId}/orders/?restaurant_id=${restaurantId}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     if (tableResponse.ok) {
//       return await tableResponse.json();
//     }

//     const orderResponse = await fetch(
//       `${API_BASE_URL}/orders/${tableId}/?restaurant_id=${restaurantId}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     if (orderResponse.ok) {
//       const order = await orderResponse.json();
//       return {
//         count: 1,
//         next: null,
//         previous: null,
//         results: [order]
//       };
//     }

//     throw new Error("Failed to fetch orders");
//   } catch (error) {
//     console.error("Table Orders API Error:", error);
//     return { results: [] };
//   }
// };

// export const fetchAllOrdersApi = async () => {
//   try {
//     const token = getToken();
//     const restaurantId = getRestaurantId();
//     const response = await fetch(
//       `${API_BASE_URL}/orders/?restaurant_id=${restaurantId}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch orders");
//     }

//     const orders = await response.json();
//     const activeStatuses = [
//       "confirmed",
//       "preparing",
//       "ready",
//       "out_for_delivery",
//       "occupied",
//       "pending",
//     ];

//     const activeOrders = orders.filter((order) =>
//       activeStatuses.includes(order.status?.toLowerCase())
//     );

//     // 🔹 Fetch full order details for each order
//     const detailedOrders = await Promise.all(
//       activeOrders.map(async (order) => {
//         try {
//           const orderDetails = await viewOrder.viewOrderDetails(order.id);
//           console.log(orderDetails,">>>> orderDetails")
//           return {
//             id: order.id,
//             tableNumber:
//               order.order_type === "takeaway"
//                 ? `TA-${order.id}`
//                 : `DL-${order.id}`,
//             status: order.status,
//             amount: parseFloat(order.total_amount || 0),
//             orderId: order.id,
//             order_type: order.order_type,
//             order_status: order.status,
//             customer_name: order.customer_name,
//             customer_phone: order.customer_phone,
//             type: order.order_type,
//             isVirtualTable: true,
//             createdAt: order.created_at,
//             order_number: order.order_number,
//             payment_method: order.payment_method,
//             payment_status: order.payment_status,

//             // 🔹 full order data
//             orderDetails: orderDetails,

//           };

//         } catch (error) {
//           console.error("Error fetching order details:", error);
//           return null;
//         }
//       })
//     );

//     const nonDineInOrders = detailedOrders
//       .filter(Boolean)
//       .filter((order) => order.order_type !== "dine_in");

//     return nonDineInOrders;
//   } catch (error) {
//     console.error("All Orders API Error:", error);
//     return [];
//   }
// };

export const fetchTableOrdersApi = async (tableId) => {
  try {
    const token = getToken();
    const restaurantId = getRestaurantId();

    const response = await fetch(
      `${API_BASE_URL}/tables/${tableId}/orders/?restaurant_id=${restaurantId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return { results: [] };
    }

    return await response.json();

  } catch (error) {
    console.error("Table Orders API Error:", error);
    return { results: [] };
  }
};

export const fetchAllOrdersApi = async () => {
  try {
    const token = getToken();
    const restaurantId = getRestaurantId();
    const response = await fetch(
      `${API_BASE_URL}/orders/?restaurant_id=${restaurantId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const orders = await response.json();
    // console.log("Raw orders from API:", orders);

    // Handle paginated response
    const ordersList = orders.results || orders || [];

    const activeStatuses = [
      "confirmed",
      "preparing",
      "ready",
      "out_for_delivery",
      "occupied",
      "pending",
    ];

    const activeOrders = ordersList.filter((order) =>
      activeStatuses.includes(order.status?.toLowerCase())
    );

    // console.log("Active orders:", activeOrders);

    // 🔹 Fetch full order details for each order
    // const detailedOrders = await Promise.all(
    //   activeOrders.map(async (order) => {
    //     try {
    //       const orderDetails = await viewOrder.viewOrderDetails(order.id);
    //       // console.log(`Order ${order.id} details:`, orderDetails);

    //       // Extract the actual order data from the response
    //       const orderData = orderDetails.order || orderDetails.data || orderDetails;

    //       return {
    //         id: order.id,
    //         tableNumber:
    //           order.order_type === "takeaway"
    //             ? `TA-${order.id}`
    //             : `DL-${order.id}`,
    //         status: order.status,
    //         amount: parseFloat(order.total_amount || 0),
    //         orderId: order.id,
    //         order_type: order.order_type,
    //         order_status: order.status,
    //         customer_name: order.customer_name,
    //         customer_phone: order.customer_phone,
    //         type: order.order_type,
    //         isVirtualTable: true,
    //         createdAt: order.created_at,
    //         order_number: order.order_number,
    //         payment_method: order.payment_method,
    //         payment_status: order.payment_status,
    //         // Store the full order data
    //         orderDetails: orderData,
    //       };

    //     } catch (error) {
    //       console.error("Error fetching order details:", error);
    //       return null;
    //     }
    //   })
    // );

    const detailedOrders = activeOrders.map((order) => ({
      id: order.id,
      tableNumber:
        order.order_type === "takeaway"
          ? `TA-${order.id}`
          : `DL-${order.id}`,
      status: order.status,
      amount: parseFloat(order.total_amount || 0),
      orderId: order.id,
      order_type: order.order_type,
      order_status: order.status,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      type: order.order_type,
      isVirtualTable: true,
      createdAt: order.created_at,
      order_number: order.order_number,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      orderDetails: order,   // reuse existing order data
    }));

    const nonDineInOrders = detailedOrders
      .filter(Boolean)
      .filter((order) => order.order_type !== "dine_in");

    // console.log("Final non-dine-in orders:", nonDineInOrders);
    return nonDineInOrders;
  } catch (error) {
    console.error("All Orders API Error:", error);
    return [];
  }
};