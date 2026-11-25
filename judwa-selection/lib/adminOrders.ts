import 'server-only';

// Checkout stores "<name> — <full address>" in orders.notes (there are no customer accounts yet)
function splitNotes(notes: string | null) {
  if (!notes) return { name: 'Guest', address: '' };
  const [name, ...rest] = notes.split(' — ');
  return { name: name || 'Guest', address: rest.join(' — ') };
}

export function toAdminOrder(row: any) {
  const { name, address } = splitNotes(row.notes);
  return {
    id: row.id,
    order_number: row.order_number,
    customer_name: name,
    customer_email: row.guest_email || '',
    customer_phone: row.guest_phone || '',
    delivery_address: address,
    order_status: row.order_status,
    payment_status: row.payment_status,
    payment_method: row.payment_method,
    subtotal: Number(row.subtotal),
    shipping_cost: Number(row.delivery_charge || 0) + Number(row.cod_charge || 0),
    total_amount: Number(row.total_amount),
    created_at: row.created_at,
    items: (row.order_items || []).map((item: any) => ({
      id: item.id,
      product_name: item.product_name || 'Product',
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: Number(item.selling_price),
      total: Number(item.item_total),
    })),
  };
}

export const ADMIN_ORDER_SELECT =
  'id, order_number, guest_email, guest_phone, notes, order_status, payment_status, payment_method, subtotal, delivery_charge, cod_charge, total_amount, created_at, order_items(id, product_name, size, color, quantity, selling_price, item_total)';
