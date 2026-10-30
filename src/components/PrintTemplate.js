import React from "react";

const PrintTemplate = ({
    type = "kot",
    items = [],
    tableNumber,
    orderType,
    itemCount,
    subtotal,
    tax_breakdown = [],
    total_amount,
    paymentMethod,
    restaurant,
    orderNotes,
    customerAddress,
    discountAmount,
    gst_number,
    fssai_number,
    restaurantAddress,
    customerName,
    customerPhone,
    orderNumber
}) => {

    const isBill = type === "bill";

    return (
        <div
            style={{
                width: "180px",
                fontFamily: "monospace",
                padding: "2px",
                margin: "0",
                fontSize: "10px",
                lineHeight: "1.2",
                color: "#000"
            }}
        >
            {/* HEADER */}
            <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: "bold", fontSize: "12px" }}>
                    {isBill ? restaurant || "RECEIPT" : "KITCHEN ORDER"}
                    {isBill && restaurantAddress && (
                        <div style={{ fontSize: "10px" }}>
                            {restaurantAddress}
                        </div>
                    )}
                </div>
            </div>
            {isBill && gst_number && (
                <>
                    <div style={{ fontWeight: "bold", fontSize: "12px" }}>
                        GST No: {gst_number}
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: "12px" }}>
                        FSSAI NO: {fssai_number}
                    </div>

                </>
            )}

            {isBill && (
                <>
                    <div style={{ fontWeight: "bold", fontSize: "10px" }}>
                        Name : {customerName}
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: "10px" }}>
                        Mobile No : {customerPhone}
                    </div>
                </>
            )}
            {isBill && customerAddress && (
                <div style={{ fontWeight: "bold", fontSize: "10px" }}>
                    Mobile No : {customerAddress}
                </div>
            )}

            <div style={{ fontSize: "10px", fontWeight: "600" }}>
                <div>Order No : #{orderNumber}</div>
                <div>Tbl: {tableNumber || "-"} , <span>Type: {orderType}</span></div>
                <div style={{ borderTop: "1px dashed #000", margin: "2px 0" }} />
                <div>{new Date().toLocaleString()}</div>
            </div>

            <div style={{ borderTop: "1px dashed #000", margin: "2px 0" }} />

            {/* ITEMS */}
            {items.map((item, i) => {
                const quantity = Number(item.quantity) || 0;

                const unitPrice =
                    Number(item.unit_price) ||
                    Number(item.selectedPrice) ||
                    Number(item.price) ||
                    Number(item.basePrice) ||
                    (
                        Number(item.finalPrice) && quantity > 0
                            ? Number(item.finalPrice) / quantity
                            : 0
                    );

                // Total price for this item
                const itemTotal = unitPrice * quantity;

                return (
                    <div key={i} style={{ marginBottom: "4px" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                fontWeight: isBill ? "normal" : "bold"
                            }}
                        >
                            {/* LEFT SIDE */}
                            <div
                                style={{
                                    width: isBill ? "130px" : "100%",
                                    borderBottom: isBill ? "1px dashed #000" : "none",
                                    paddingBottom: "2px"
                                }}
                            >
                                <span
                                    style={{
                                        wordWrap: "break-word",
                                        fontSize: isBill ? "11px" : "12px",
                                        fontWeight: "600"
                                    }}
                                >
                                    {quantity}x {item.name}
                                    {item.sizeName ? ` (${item.sizeName})` : ""}
                                </span>

                                {/* UNIT PRICE */}
                                {isBill && (
                                    <div
                                        style={{
                                            fontSize: "9px",
                                            marginLeft: "4px",
                                            fontWeight: "600"
                                        }}
                                    >
                                        ₹{unitPrice.toFixed(2)}
                                    </div>
                                )}

                                {/* ADDONS */}
                                {item.addons?.length > 0 && (
                                    <div
                                        style={{
                                            fontSize: "9px",
                                            marginLeft: "4px",
                                            lineHeight: "1.1",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        {item.addons.map((addon, idx) => (
                                            <div key={idx}>
                                                + {addon.name || addon}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* INSTRUCTIONS */}
                                {item.special_instructions && (
                                    <div
                                        style={{
                                            fontSize: "9px",
                                            marginLeft: "4px",
                                            lineHeight: "1.1",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        <div>+ {item.special_instructions}</div>
                                    </div>
                                )}
                            </div>

                            {/* TOTAL ITEM PRICE */}
                            {isBill && (
                                <span
                                    style={{
                                        width: "60px",
                                        textAlign: "right",
                                        whiteSpace: "nowrap",
                                        paddingRight: "4px",
                                        fontWeight: "600",
                                        fontSize: "11px"
                                    }}
                                >
                                    ₹{itemTotal.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}

            {orderNotes && (
                <>
                    <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />

                    <div style={{
                        fontSize: "10px",
                        fontWeight: "bold",
                        marginBottom: "2px"
                    }}>
                        Note:
                    </div>

                    <div style={{
                        fontSize: "10px",
                        wordWrap: "break-word"
                    }}>
                        {orderNotes}
                    </div>
                </>
            )}

            <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />

            {/* FOOTER */}
            {!isBill ? (
                <div style={{ fontWeight: "bold", textAlign: "center" }}>
                    ITEMS: {itemCount}
                </div>
            ) : (
                <>
                    <Row label="Subtotal" value={`₹${(parseFloat(subtotal) || 0).toFixed(2)}`} />

                    {tax_breakdown.map((tax, i) => (
                        <Row key={i} label={tax.name} value={`₹${(parseFloat(tax.amount) || 0).toFixed(2)}`} />
                    ))}

                    {Number(discountAmount) > 0 && (
                        <Row
                            label="Discount"
                            value={`₹${(parseFloat(discountAmount) || 0).toFixed(2)}`}
                            bold
                            big
                        />
                    )}
                    <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />

                    <Row
                        label="TOTAL"
                        value={`₹${(parseFloat(total_amount) || 0).toFixed(2)}`}
                        bold
                        big
                    />

                    <div style={{ marginTop: "4px", fontSize: "10px", fontWeight: "600" }}>
                        Pay: {paymentMethod}
                    </div>
                </>
            )}
            <div style={{ textAlign: "center", marginBottom: "4px", fontWeight: "600" }}>
                {isBill && <div>Thank You 🙏</div>}
            </div>
        </div>
    );
};

/* Reusable Row Component */
const Row = ({ label, value, bold, big }) => (
    <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        }}
    >
        {/* LEFT */}
        <span
            style={{
                width: "110px",
                fontSize: big ? "12px" : "10px",
                fontWeight: "600"
            }}
        >
            {label}
        </span>

        {/* RIGHT */}
        <span
            style={{
                width: "90px",
                textAlign: "right",
                fontWeight: bold ? "bold" : "bold",
                fontSize: big ? "11px" : "9px",
                lineHeight: "1.2",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                paddingRight: "2px"
            }}
        >
            {value}
        </span>
    </div>
);

export default PrintTemplate;