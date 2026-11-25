import { supabaseServer } from '../supabase';
import { generateOrderNumber, generateReturnNumber } from '../utils';
import { Order, OrderItem } from '../types';

/**
 * Create a new order
 */
export const createOrder = async (orderData: any) => {
  try {
    const orderNumber = generateOrderNumber();

    const { data, error } = await supabaseServer
      .from('orders')
      .insert({
        ...orderData,
        order_number: orderNumber,
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating order:', error);
    return { data: null, error };
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: string) => {
  try {
    const { data, error } = await supabaseServer
      .from('orders')
      .select('*, order_items(*, product:products(*), variant:product_variants(*)), payment:payments(*)')
      .eq('id', orderId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching order:', error);
    return { data: null, error };
  }
};

/**
 * Get order by order number
 */
export const getOrderByNumber = async (orderNumber: string) => {
  try {
    const { data, error } = await supabaseServer
      .from('orders')
      .select('*, order_items(*, product:products(*), variant:product_variants(*)), payment:payments(*)')
      .eq('order_number', orderNumber)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching order:', error);
    return { data: null, error };
  }
};

/**
 * Get user orders
 */
export const getUserOrders = async (userId: string, limit: number = 10, offset: number = 0) => {
  try {
    const { data, error, count } = await supabaseServer
      .from('orders')
      .select('*, order_items(count)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data, count, error: null };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return { data: null, count: 0, error };
  }
};

/**
 * Add order items
 */
export const addOrderItems = async (orderItems: OrderItem[]) => {
  try {
    const { data, error } = await supabaseServer
      .from('order_items')
      .insert(orderItems)
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error adding order items:', error);
    return { data: null, error };
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const { data, error } = await supabaseServer
      .from('orders')
      .update({
        order_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { data: null, error };
  }
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (orderId: string, status: string, paymentId?: string) => {
  try {
    const { data, error } = await supabaseServer
      .from('orders')
      .update({
        payment_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { data: null, error };
  }
};

/**
 * Create return request
 */
export const createReturnRequest = async (returnData: any) => {
  try {
    const returnNumber = generateReturnNumber();

    const { data, error } = await supabaseServer
      .from('returns')
      .insert({
        ...returnData,
        return_number: returnNumber,
        return_status: 'requested',
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating return request:', error);
    return { data: null, error };
  }
};

/**
 * Get returns for user
 */
export const getUserReturns = async (userId: string, limit: number = 10, offset: number = 0) => {
  try {
    const { data, error, count } = await supabaseServer
      .from('returns')
      .select('*, order:orders(*), order_item:order_items(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('requested_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data, count, error: null };
  } catch (error) {
    console.error('Error fetching returns:', error);
    return { data: null, count: 0, error };
  }
};

/**
 * Create payment record
 */
export const createPayment = async (paymentData: any) => {
  try {
    const { data, error } = await supabaseServer
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating payment:', error);
    return { data: null, error };
  }
};

/**
 * Get order analytics
 */
export const getOrderAnalytics = async (daysBack: number = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const { data, error } = await supabaseServer
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const totalOrders = data?.length || 0;
    const totalRevenue = data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      data: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        rawData: data,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    return { data: null, error };
  }
};

/**
 * Get daily sales
 */
export const getDailySales = async (date?: string) => {
  try {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabaseServer
      .from('orders')
      .select('*')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    if (error) throw error;

    const sales = data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const orderCount = data?.length || 0;

    return {
      data: {
        sales,
        orderCount,
        date: targetDate.toISOString().split('T')[0],
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching daily sales:', error);
    return { data: null, error };
  }
};

/**
 * Get monthly profit
 */
export const getMonthlyProfit = async (month?: number, year?: number) => {
  try {
    const now = new Date();
    const targetMonth = month ?? now.getMonth();
    const targetYear = year ?? now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    const { data, error } = await supabaseServer
      .from('orders')
      .select('*, order_items(*, variant:product_variants(*))')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    // Calculate profit
    let totalProfit = 0;
    data?.forEach((order) => {
      order.order_items?.forEach((item: any) => {
        const profit = (item.selling_price - item.purchase_price) * item.quantity;
        totalProfit += profit;
      });
    });

    return {
      data: {
        profit: totalProfit,
        orderCount: data?.length || 0,
        month: targetMonth,
        year: targetYear,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching monthly profit:', error);
    return { data: null, error };
  }
};
