export const syncPendingData = async () => {

  // ✅ FIX ERROR HERE
  if (!window.electronAPI) {
    console.log("Running in browser → skip sync");
    return;
  }

  const pendingOrders = await window.electronAPI.getPendingOrders();

  for (let order of pendingOrders) {
    try {
      const parsed = JSON.parse(order.data);

      await fetch("https://your-api.com/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed),
      });

      await window.electronAPI.markOrderSynced(order.id);

    } catch (err) {
      console.log("Sync failed:", err);
    }
  }
};