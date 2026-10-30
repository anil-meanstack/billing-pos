const PdfTemplate = ({
    items = [],
    tableNumber,
    orderType,
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

    const formatPrice = (value) => {
        return `₹${(Number(value) || 0).toFixed(2)}`;
    };

    return (
        <div style={{
            width: "100%",
            padding: "6px",
            margin: "0",
            fontFamily: "monospace",
            fontSize: "10px",
            lineHeight: "1.25",
            color: "#000",
            boxSizing: "border-box"
        }}
        >
            <div style={{ textAlign: "center", marginBottom: "5px" }}>
                <div style={{ fontSize: "15px", fontWeight: "bold" }}>
                    {restaurant || "RECEIPT"}
                </div>

                {restaurantAddress && (
                    <div style={{ fontSize: "9px", marginTop: "2px" }}>
                        {restaurantAddress}
                    </div>
                )}

                {gst_number && (
                    <div style={{ fontSize: "9px", fontWeight: "bold" }}>
                        GST No: {gst_number}
                    </div>
                )}

                {fssai_number && (
                    <div style={{ fontSize: "9px", fontWeight: "bold" }}>
                        FSSAI No: {fssai_number}
                    </div>
                )}
            </div>

            <Divider />

            {(customerName ||
                customerPhone ||
                customerAddress) && (
                    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "4px" }}>
                        <tbody>
                            <tr>
                                {customerName && (
                                    <>
                                        <td style={labelStyle}>
                                            Name
                                        </td>
                                        <td style={valueStyle}>
                                            : {customerName}
                                        </td>
                                    </>
                                )}

                                {customerPhone && (
                                    <>
                                        <td style={labelStyle}>
                                            Mobile
                                        </td>
                                        <td style={valueStyle}>
                                            : {customerPhone}
                                        </td>
                                    </>
                                )}
                            </tr>
                            {customerAddress && (
                                <tr>
                                    <td style={{
                                        ...labelStyle,
                                        verticalAlign: "top"
                                    }}
                                    >
                                        Address
                                    </td>
                                    <td style={{
                                        ...valueStyle,
                                        wordBreak: "normal",
                                        overflowWrap: "break-word"
                                    }}
                                    >
                                        : {customerAddress}
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </table>
                )}

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "3px" }}>
                <tbody>
                    <tr>
                        {orderNumber && (
                            <>
                                <td style={labelStyle}>
                                    Order No
                                </td>
                                <td style={valueStyle}>
                                    : #{orderNumber}
                                </td>
                            </>
                        )}


                        <td style={labelStyle}>
                            Table
                        </td>
                        <td style={valueStyle}>
                            : {tableNumber || "-"}
                        </td>
                    </tr>

                    <tr>
                        <td style={labelStyle}>
                            Type
                        </td>
                        <td style={valueStyle}>
                            : {orderType || "-"}
                        </td>

                        <td style={labelStyle}>
                            Date
                        </td>
                        <td style={valueStyle}>
                            : {new Date().toLocaleString()}
                        </td>
                    </tr>

                </tbody>
            </table>

            <Divider />


            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid #000" }}>
                        <th style={{ width: "50%", textAlign: "left", padding: "3px 0", fontSize: "9px" }}>
                            ITEM
                        </th>
                        <th style={{ width: "16%", textAlign: "center", padding: "3px 0", fontSize: "9px" }}>
                            Price
                        </th>

                        <th style={{ width: "12%", textAlign: "center", padding: "3px 0", fontSize: "9px" }}>
                            QTY
                        </th>

                        <th style={{ width: "22%", textAlign: "right", padding: "3px 0", fontSize: "9px" }}>
                            TOTAL
                        </th>
                    </tr>
                </thead>

                <tbody>

                    {items.map((item, index) => {

                        const quantity = Number(item.quantity) || 0;

                        const unitPrice =
                            Number(item.unit_price) ||
                            Number(item.selectedPrice) ||
                            Number(item.price) ||
                            Number(item.basePrice) ||
                            (
                                Number(item.finalPrice) &&
                                    quantity > 0
                                    ? Number(item.finalPrice) /
                                    quantity
                                    : 0
                            );

                        const itemTotal = unitPrice * quantity;

                        return (
                            <tr key={index} style={{ borderBottom: "1px dashed #999" }}>

                                {/* ITEM */}
                                <td
                                    style={{
                                        padding: "5px 2px 5px 0",
                                        verticalAlign: "top",
                                        fontSize: "10px",
                                        fontWeight: "bold",
                                        whiteSpace: "normal",
                                        wordBreak: "normal",
                                        overflowWrap: "break-word"
                                    }}
                                >

                                    <div>
                                        {item.name}

                                        {item.sizeName && (
                                            <span>
                                                {" "}
                                                ({item.sizeName})
                                            </span>
                                        )}
                                    </div>

                                    {item.addons?.length > 0 && (
                                        <div style={{ fontSize: "8px", fontWeight: "normal", marginTop: "2px", lineHeight: "1.2" }}>
                                            {item.addons.map((addon, addonIndex) => (
                                                <div key={addonIndex}>
                                                    +{" "}
                                                    {addon.name || addon}
                                                </div>
                                            )
                                            )}
                                        </div>
                                    )}

                                    {item.special_instructions && (
                                        <div style={{ fontSize: "8px", fontWeight: "normal", marginTop: "2px", lineHeight: "1.2" }}>
                                            Note:{" "}
                                            {item.special_instructions}
                                        </div>
                                    )}

                                </td>
                                <td style={{ width: "16%", verticalAlign: "top", padding: "5px 0", fontSize: "10px", textAlign: "center" }}>
                                    {formatPrice(unitPrice)}
                                </td>

                                <td style={{ width: "12%", textAlign: "center", verticalAlign: "top", padding: "5px 0", fontSize: "10px" }}>
                                    {quantity}
                                </td>

                                <td style={{ width: "28%", textAlign: "right", verticalAlign: "top", padding: "5px 0", fontSize: "10px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                                    {formatPrice(itemTotal)}
                                </td>

                            </tr>
                        );
                    })}

                </tbody>
            </table>

            {orderNotes && (
                <>
                    <Divider />

                    <div style={{ fontWeight: "bold", fontSize: "9px", marginBottom: "2px" }}>
                        Order Note:
                    </div>

                    <div style={{ fontSize: "9px", wordBreak: "normal", overflowWrap: "break-word" }}>
                        {orderNotes}
                    </div>
                </>
            )}

            <Divider width="30%" />

            <table style={{ width: "30%", borderCollapse: "collapse", textAlign: "end" }}>
                <tbody>

                    <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />

                    {tax_breakdown.map((tax, index) => (
                        <SummaryRow key={index} label={tax.name || "Tax"} value={formatPrice(tax.amount)} />
                    ))}

                    {Number(discountAmount) > 0 && (
                        <SummaryRow label="Discount" value={`- ${formatPrice(discountAmount)}`} bold />
                    )}

                </tbody>
            </table>

            <Divider width="30%" />

            <table style={{ width: "30%", borderCollapse: "collapse", textAlign: "end" }}>
                <tbody>
                    <tr>
                        <td style={{ fontSize: "13px", fontWeight: "bold", padding: "2px 0" }}>
                            TOTAL
                        </td>

                        <td style={{ textAlign: "right", fontSize: "13px", fontWeight: "bold", padding: "2px 0" }}>
                            {formatPrice(total_amount)}
                        </td>
                    </tr>
                </tbody>
            </table>

            {paymentMethod && (
                <div style={{ width: "30%", marginTop: "6px", fontSize: "10px", fontWeight: "bold", textAlign: "end" }}>
                    Payment: {paymentMethod}
                </div>
            )}

            <div style={{ textAlign: "center", marginTop: "10px", fontWeight: "bold", fontSize: "10px" }}>
                Thank You 🙏
            </div>

        </div>
    );
};

const Divider = ({ width }) => (
    <div style={{ borderTop: "1px dashed #000", margin: "5px 0", width: width, }} />
);

const labelStyle = {
    width: "20%",
    fontSize: "9px",
    fontWeight: "bold",
    padding: "1px 0",
    verticalAlign: "top"
};

const valueStyle = {
    fontSize: "9px",
    padding: "1px 0",
    verticalAlign: "top",
    wordBreak: "normal",
    overflowWrap: "break-word"
};

const SummaryRow = ({ label, value, bold = false }) => (
    <tr>
        <td style={{ fontSize: "10px", padding: "2px 0", fontWeight: bold ? "bold" : "normal" }}>
            {label}
        </td>

        <td style={{ fontSize: "10px", padding: "2px 0", textAlign: "right", fontWeight: "bold", whiteSpace: "nowrap" }}>
            {value}
        </td>
    </tr>
);


export default PdfTemplate;