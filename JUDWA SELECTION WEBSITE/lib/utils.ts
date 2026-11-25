// Utility functions for JUDWA SELECTION

/**
 * Format currency in Indian Rupees
 */
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercent = (mrp: number, selling_price: number): number => {
  if (mrp <= 0) return 0;
  return Math.round(((mrp - selling_price) / mrp) * 100);
};

/**
 * Calculate profit for an order
 */
export const calculateProfit = (selling_price: number, purchase_price: number, quantity: number = 1): number => {
  return (selling_price - purchase_price) * quantity;
};

/**
 * Calculate cart totals
 */
export const calculateCartTotals = (
  subtotal: number,
  discountAmount: number = 0,
  deliveryCharge: number = 0,
  codCharge: number = 0,
  couponDiscount: number = 0
): { subtotal: number; total_discount: number; total: number } => {
  const total_discount = discountAmount + couponDiscount;
  const total = subtotal - total_discount + deliveryCharge + codCharge;
  return {
    subtotal: Math.max(0, subtotal),
    total_discount: Math.max(0, total_discount),
    total: Math.max(0, total),
  };
};

/**
 * Generate unique order number
 */
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ORD${timestamp}${random}`;
};

/**
 * Generate unique return number
 */
export const generateReturnNumber = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `RET${timestamp}${random}`;
};

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Validate pincode (Indian)
 */
export const isValidPincode = (pincode: string): boolean => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

/**
 * Format date with time
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Get estimated delivery date
 */
export const getEstimatedDeliveryDate = (estimatedDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + estimatedDays);
  return formatDate(date.toISOString());
};

/**
 * Slugify text
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Check if product is in stock
 */
export const isInStock = (stock: number): boolean => {
  return stock > 0;
};

/**
 * Get stock status
 */
export const getStockStatus = (stock: number): string => {
  if (stock > 10) return 'In Stock';
  if (stock > 0) return 'Low Stock';
  return 'Out of Stock';
};

/**
 * Calculate GST (18% assumed)
 */
export const calculateGST = (amount: number, gstPercent: number = 18): number => {
  return (amount * gstPercent) / 100;
};

/**
 * Check if coupon is valid
 */
export const isCouponValid = (coupon: any): boolean => {
  if (!coupon || !coupon.is_active) return false;

  const today = new Date();
  const startDate = coupon.start_date ? new Date(coupon.start_date) : null;
  const endDate = coupon.end_date ? new Date(coupon.end_date) : null;

  if (startDate && today < startDate) return false;
  if (endDate && today > endDate) return false;

  return true;
};

/**
 * Apply coupon discount
 */
export const applyCouponDiscount = (
  subtotal: number,
  coupon: any
): { discount: number; discountedAmount: number } => {
  if (!isCouponValid(coupon)) {
    return { discount: 0, discountedAmount: subtotal };
  }

  const minimumAmount = coupon.minimum_order_amount || 0;
  if (subtotal < minimumAmount) {
    return { discount: 0, discountedAmount: subtotal };
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (subtotal * coupon.discount_value) / 100;
  } else if (coupon.discount_type === 'flat') {
    discount = coupon.discount_value;
  }

  if (coupon.maximum_discount_amount) {
    discount = Math.min(discount, coupon.maximum_discount_amount);
  }

  return {
    discount: Math.round(discount),
    discountedAmount: Math.max(0, subtotal - discount),
  };
};

/**
 * Get size label
 */
export const getSizeLabel = (size: string): string => {
  const sizeLabelMap: Record<string, string> = {
    '0-3M': '0-3 Months',
    '3-6M': '3-6 Months',
    '6-12M': '6-12 Months',
    '1-2Y': '1-2 Years',
    '2-3Y': '2-3 Years',
    '3-4Y': '3-4 Years',
    '4-5Y': '4-5 Years',
    '5-6Y': '5-6 Years',
    '6-7Y': '6-7 Years',
    '7-8Y': '7-8 Years',
    '8-9Y': '8-9 Years',
    '9-10Y': '9-10 Years',
    '10-11Y': '10-11 Years',
    '11-12Y': '11-12 Years',
    '12-13Y': '12-13 Years',
    '13-14Y': '13-14 Years',
    '14-15Y': '14-15 Years',
  };
  return sizeLabelMap[size] || size;
};

/**
 * Get age from size
 */
export const getAgeGroup = (size: string): string => {
  const ageMap: Record<string, string> = {
    '0-3M': 'Newborn',
    '3-6M': 'Newborn',
    '6-12M': 'Newborn',
    '1-2Y': 'Toddler',
    '2-3Y': 'Toddler',
    '3-4Y': 'Kids',
    '4-5Y': 'Kids',
    '5-6Y': 'Kids',
    '6-7Y': 'Kids',
    '7-8Y': 'Kids',
    '8-9Y': 'Pre-Teen',
    '9-10Y': 'Pre-Teen',
    '10-11Y': 'Pre-Teen',
    '11-12Y': 'Pre-Teen',
    '12-13Y': 'Teen',
    '13-14Y': 'Teen',
    '14-15Y': 'Teen',
  };
  return ageMap[size] || 'Kids';
};
