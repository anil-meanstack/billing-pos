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
    discountAmount,
    gst_number,
    address,
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
                    {isBill && address && (
                        <div style={{fontSize:"10px"}}>
                            {address}
                        </div>
                    )}
                </div>
            </div>
            {isBill && gst_number && (
                <div style={{ fontWeight: "bold", fontSize: "12px" }}>
                    GST No: {gst_number}
                </div>
            )}

            {/* ORDER INFO */}
            <div style={{ fontSize: "10px" ,fontWeight:"600" }}>
                <div>Order No : #{orderNumber}</div>
                <div>Tbl: {tableNumber || "-"} , <span>Type: {orderType}</span></div>
                <div>{new Date().toLocaleString()}</div>
            </div>

            <div style={{ borderTop: "1px dashed #000", margin: "2px 0" }} />

            {/* ITEMS */}
            {items.map((item, i) => (
                <div key={i} style={{ marginBottom: "2px" }}>
                    {/* ITEM ROW */}
                    <div
                        style={{
                            display: "flex",
                            // justifyContent: "space-between",
                            alignItems: "center",
                            fontWeight: isBill ? "normal" : "bold"
                        }}
                    >
                        <span style={{
                            width: isBill ? "130px" : "100%",
                            wordWrap: "break-word",
                            fontSize: isBill ? "11px" : "12px",
                            fontWeight:"600"
                        }}>
                            {item.quantity}x {item.name}
                            {item.sizeName ? ` (${item.sizeName})` : ""}
                        </span>

                        {isBill && (
                            <span style={{
                                width: "60px",
                                textAlign: "right",
                                whiteSpace: "nowrap",
                                paddingRight: "4px",
                                fontWeight:"600"
                            }}>
                                ₹{(parseFloat(item.finalPrice ?? item.selectedPrice ?? item.price ?? 0) || 0).toFixed(2)}
                            </span>
                        )}
                    </div>

                    {/* ADDONS */}
                    {item.addons?.length > 0 && (
                        <div style={{ fontSize: "8px", marginLeft: "4px" ,lineHeight: "1.1" }}>
                            {item.addons.map((addon, idx) => (
                                <div key={idx}>+ {addon.name}</div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
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

                    <div style={{ marginTop: "4px", fontSize: "10px" ,fontWeight:"600"}}>
                        Pay: {paymentMethod}
                    </div>
                </>
            )}
            <div style={{ textAlign: "center", marginBottom: "4px" ,fontWeight:"600"}}>
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
                fontWeight: bold ? "bold" : "normal",
                fontSize: big ? "12px" : "10px",
                fontWeight:"600"
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