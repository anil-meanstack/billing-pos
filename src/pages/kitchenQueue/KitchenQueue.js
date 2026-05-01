import React, { useEffect, useState } from "react";
import "./KitchenQueue.css";
import {
    getKitchenTickets,
    getKitchenTicketById,
    TicketStatus,
} from "../../features/kitchen/kitchenApi";
import { setKitchenCounts } from "../../features/kitchen/kitchenSlice";
import { useDispatch } from "react-redux";

const KitchenQueue = () => {
    const [orders, setOrders] = useState([]);
    const [detailedOrders, setDetailedOrders] = useState({});
    const dispatch = useDispatch();

    useEffect(() => {
        loadOrders()
    }, []);

    const loadOrders = async () => {
        try {
            const [pending, preparing, ready] = await Promise.all([
                getKitchenTickets("pending"),
                getKitchenTickets("preparing"),
                getKitchenTickets("ready"),

            ]);
            const normalize = (res) =>
                Array.isArray(res) ? res : res?.results || [];
            const allOrders = [
                ...normalize(pending),
                ...normalize(preparing),
                ...normalize(ready),
            ];

            setOrders(allOrders);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        dispatch(setKitchenCounts({
            new: newOrders.length,
            preparing: preparingOrders.length,
            ready: readyOrders.length
        }));
    }, [orders]);

    useEffect(() => {
        orders.forEach(async (order) => {
            if (detailedOrders[order.id]) return;

            try {
                const detail = await getKitchenTicketById(order.id);
                setDetailedOrders((prev) => ({
                    ...prev,
                    [order.id]: detail,
                }));
            } catch (err) {
                console.error(err);
            }
        });
    }, [orders]);

    const handleStatusChange = async (ticketId, nextStatus) => {
        try {
            await TicketStatus.updateTicketStatus(ticketId, {
                status: nextStatus,
            });
            loadOrders();
        } catch (err) {
            console.error(err);
        }
    };

    const getMinutes = (time) => {
        return Math.floor((Date.now() - new Date(time)) / 60000);
    };

    const newOrders = orders.filter((o) => o.status === "pending");
    const preparingOrders = orders.filter((o) => o.status === "preparing");
    const readyOrders = orders.filter((o) => o.status === "ready")

    const OrderCard = ({ order }) => {
        const detail = detailedOrders[order.id];

        return (
            <div className="order-card">
                {/* Top */}
                <div className="order-top">
                    <div>
                        <span className="kotid">KOT #{order?.kot_number}</span>
                        <div className="order-type">
                        {detail?.order?.table_number && (
                            <span>
                                Table: {detail?.order?.table_number} - 
                            </span>
                        )}
                         {detail?.order?.order_type_display}
                    </div>
                    </div>
                    <div className="order-times">
                        <span className="waiting">{getMinutes(order.created_at)}m ago</span>
                    </div>
                </div>

                {/* Items */}
                <div className="items-list">
                    {!detail ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <>
                            {detail?.items?.map((item, i) => (
                                <div className="item-card" key={i}>
                                    <div>
                                        <div className="item-title">{item.item_name}</div>

                                        {/* ✅ VARIANTS */}
                                        {item.variants && item.variants.length > 0 && (
                                            <div className="item-sub">
                                                • {item.variants.map((v) => `${v.name} (${v.group})`).join(", ")}
                                            </div>
                                        )}

                                        {/* ✅ ADDONS */}
                                        {item.addons && item.addons.length > 0 && (
                                            <div className="item-sub addons">
                                                + {item.addons.map((a) => a.name).join(", ")}
                                            </div>
                                        )}
                                    </div>

                                    <div className="qty">x{item.quantity}</div>
                                </div>
                            ))}
                            {detail?.order?.order_notes && (
                                <div className="special-instruction fw-semibold">
                                    <strong>Note:</strong> {detail.order.order_notes}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="order-actions">
                    {order.status === "pending" && (
                        <>
                            <button
                                className="btn start"
                                onClick={() =>
                                    handleStatusChange(order.id, "preparing")
                                }
                            >
                                ▶ Start
                            </button>
                            <button className="btn cancel">✕ Cancel</button>
                        </>
                    )}

                    {order.status === "preparing" && (
                        <button
                            className="btn ready"
                            onClick={() =>
                                handleStatusChange(order.id, "ready")
                            }
                        >
                           ✓ Mark Ready
                        </button>
                    )}

                    {order.status === "ready" && (
                        <button
                            className="btn served"
                            onClick={() =>
                                handleStatusChange(order.id, "served")
                            }
                        >
                           ✓ Served - Close
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="kitchan-heading">
                    <h2 >Kitchen Queue</h2>
                    <h6>Live KOT board</h6>
                </div>
                <div className="d-flex justify-content-between gap-3">
                    <div className="status-card new">
                        <div className="count">{newOrders.length}</div>
                        <div className="label">NEW</div>
                    </div>

                    <div className="status-card preparing">
                        <div className="count">{preparingOrders.length}</div>
                        <div className="label">PREPARING</div>
                    </div>

                    <div className="status-card readys">
                        <div className="count">{readyOrders.length}</div>
                        <div className="label">READY</div>
                    </div>
                </div>
            </div>

            <div className="columns-container">
                {/* NEW */}
                <div className="column">
                    <div className="column-header new-header">🔴 New Orders <span className="counts">{newOrders.length}</span></div>
                    <div className="column-content">
                        {newOrders.length === 0 ? (
                            <div className="empty-state">No orders</div>
                        ) : (
                            newOrders.map((o) => <OrderCard key={o.id} order={o} />)
                        )}
                    </div>
                </div>

                {/* PREPARING */}
                <div className="column">
                    <div className="column-header preparing-header">
                        🔵 Preparing <span className="counts">{preparingOrders.length}</span>
                    </div>
                    <div className="column-content">
                        {preparingOrders.length === 0 ? (
                            <div className="empty-state">No orders</div>
                        ) : (
                            preparingOrders.map((o) => (
                                <OrderCard key={o.id} order={o} />
                            ))
                        )}
                    </div>
                </div>

                {/* READY */}
                <div className="column">
                    <div className="column-header ready-header">🟢 Ready to Serve <span className="counts">{readyOrders.length}</span></div>
                    <div className="column-content">
                        {readyOrders.length === 0 ? (
                            <div className="empty-state">No orders</div>
                        ) : (
                            readyOrders.map((o) => (
                                <OrderCard key={o.id} order={o} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KitchenQueue;