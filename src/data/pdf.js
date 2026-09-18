import jsPDF from "jspdf";

export function downloadBillPdf(sale, storeName) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.text(storeName || "MedTrack Pharmacy", 105, y, { align: "center" });
  y += 6;
  doc.setFontSize(11);
  doc.text("Invoice", 105, y, { align: "center" });
  y += 12;

  doc.setFontSize(10);
  doc.text(`Bill Number: ${sale.billNumber}`, 14, y);
  y += 6;
  doc.text(`Date: ${new Date(sale.createdAt).toLocaleString()}`, 14, y);
  y += 6;
  doc.text(`Customer: ${sale.customerName}`, 14, y);
  y += 6;
  doc.text(`Payment Mode: ${sale.paymentMode}`, 14, y);
  y += 10;

  doc.setFontSize(11);
  doc.text("Items", 14, y);
  y += 6;
  doc.setFontSize(10);
  sale.items.forEach((item) => {
    doc.text(
      `${item.name}  x${item.quantity}   Rs. ${(item.price * item.quantity).toFixed(2)}`,
      14,
      y
    );
    y += 6;
  });

  y += 4;
  doc.text(`Subtotal: Rs. ${sale.subtotal.toFixed(2)}`, 140, y);
  y += 6;
  doc.text(`Tax: Rs. ${sale.tax.toFixed(2)}`, 140, y);
  y += 6;
  doc.setFontSize(12);
  doc.text(`Total: Rs. ${sale.total.toFixed(2)}`, 140, y);

  y += 16;
  doc.setFontSize(9);
  doc.text("Thank you — get well soon!", 105, y, { align: "center" });

  doc.save(`${sale.billNumber}.pdf`);
}
