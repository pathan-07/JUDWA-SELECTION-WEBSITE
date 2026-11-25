// Builds the order invoice as a real PDF file (works on phones, where the print dialog is unreliable)
import type { StoreSettings } from './storeSettings';

export interface InvoiceOrder {
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  total_amount: number;
  items: { product_name: string; size: string; color: string; quantity: number; price: number; total: number }[];
}

// Built-in PDF fonts have no ₹ glyph
const rs = (n: number) => `Rs. ${Number(n).toLocaleString('en-IN')}`;

export async function buildInvoicePdf(order: InvoiceOrder, store: StoreSettings, gstin: string) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const right = pageWidth - margin;

  // Store header
  doc.setFont('helvetica', 'bold').setFontSize(18).text(store.storeName, margin, 20);
  doc.setFont('helvetica', 'normal').setFontSize(9);
  let y = 26;
  for (const line of doc.splitTextToSize(store.address || '', 100)) {
    doc.text(line, margin, y);
    y += 4.5;
  }
  const contact = [store.phones.join(', '), store.email].filter(Boolean).join('  |  ');
  if (contact) {
    doc.text(contact, margin, y);
    y += 4.5;
  }
  if (gstin) {
    doc.setFont('helvetica', 'bold').text(`GSTIN: ${gstin}`, margin, y);
    y += 4.5;
  }

  // Invoice meta (right side)
  doc.setFont('helvetica', 'bold').setFontSize(14).text(gstin ? 'TAX INVOICE' : 'INVOICE', right, 20, { align: 'right' });
  doc.setFont('helvetica', 'normal').setFontSize(9);
  doc.text(`Order #: ${order.order_number}`, right, 26, { align: 'right' });
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, right, 30.5, { align: 'right' });
  const payment = order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online (Prepaid)';
  doc.text(`Payment: ${payment} (${order.payment_status})`, right, 35, { align: 'right' });

  y = Math.max(y, 38) + 2;
  doc.setLineWidth(0.5).line(margin, y, right, y);
  y += 7;

  // Seller (left) and customer (right) side by side, like a courier label
  const colWidth = (right - margin) / 2 - 6;
  const block = (x: number, title: string, name: string, lines: string[]) => {
    let by = y;
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(90).text(title, x, by);
    by += 5;
    doc.setTextColor(20).setFontSize(11).text(doc.splitTextToSize(name, colWidth)[0], x, by);
    by += 5;
    doc.setFont('helvetica', 'normal').setFontSize(9);
    for (const line of lines.flatMap(l => doc.splitTextToSize(l, colWidth))) {
      doc.text(line, x, by);
      by += 4.5;
    }
    return by;
  };
  const fromEnd = block(
    margin,
    'FROM (SELLER)',
    store.storeName,
    [store.address, store.phones.length ? `Phone: ${store.phones.join(', ')}` : '', gstin ? `GSTIN: ${gstin}` : ''].filter(Boolean)
  );
  const toEnd = block(
    margin + colWidth + 12,
    'SHIP TO (CUSTOMER)',
    order.customer_name,
    [order.delivery_address, `Phone: ${order.customer_phone}`, order.customer_email ? `Email: ${order.customer_email}` : ''].filter(Boolean)
  );
  y = Math.max(fromEnd, toEnd);

  autoTable(doc, {
    startY: y + 3,
    head: [['#', 'Product', 'Size', 'Color', 'Qty', 'Price', 'Total']],
    body: order.items.map((item, i) => [
      i + 1,
      item.product_name,
      item.size,
      item.color,
      item.quantity,
      rs(item.price),
      rs(item.total),
    ]),
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, textColor: 20 },
    headStyles: { fillColor: [235, 235, 235], textColor: 20, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 8 }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' } },
    margin: { left: margin, right: margin },
  });

  // Totals
  y = ((doc as any).lastAutoTable?.finalY ?? y) + 8;
  const labelX = right - 70;
  const row = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(bold ? 11 : 9.5);
    doc.text(label, labelX, y);
    doc.text(value, right, y, { align: 'right' });
    y += bold ? 7 : 5.5;
  };
  row('Subtotal', rs(order.subtotal));
  row('Shipping / COD charges', rs(order.shipping_cost));
  doc.setLineWidth(0.4).line(labelX, y - 3.5, right, y - 3.5);
  y += 1.5;
  row('Total', rs(order.total_amount), true);
  if (order.payment_method === 'cod' && order.payment_status !== 'completed') {
    doc.setFont('helvetica', 'bold').setFontSize(9.5).text(`Amount to collect on delivery: ${rs(order.total_amount)}`, right, y, { align: 'right' });
    y += 6;
  }

  doc.setFont('helvetica', 'normal').setFontSize(10).text(`Thank you for shopping with ${store.storeName}!`, pageWidth / 2, y + 12, { align: 'center' });
  doc.setFontSize(8).setTextColor(110).text('This is a computer-generated invoice.', pageWidth / 2, y + 17, { align: 'center' });

  return doc;
}
