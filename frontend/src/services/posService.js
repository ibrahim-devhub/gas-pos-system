import { supabase } from '../lib/supabase';

export async function getStockItems(businessId) {
  const { data, error } = await supabase
    .from('stock')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(withStockStatus);
}

export async function saveStockItem(businessId, item, editingId) {
  const payload = {
    business_id: businessId,
    product_name: item.product_name,
    cylinder_size: item.cylinder_size,
    quantity: Number(item.quantity || 0),
    buying_price: Number(item.buying_price || 0),
    selling_price: Number(item.selling_price || 0),
    low_stock_limit: Number(item.low_stock_limit || 5)
  };

  const query = editingId
    ? supabase.from('stock').update(payload).eq('id', editingId).eq('business_id', businessId)
    : supabase.from('stock').insert(payload);

  const { data, error } = await query.select().single();
  if (error) throw error;
  return withStockStatus(data);
}

export async function deleteStockItem(businessId, id) {
  const { error } = await supabase.from('stock').delete().eq('id', id).eq('business_id', businessId);
  if (error) throw error;
}

export async function getSales(businessId, limit) {
  let query = supabase.from('sales').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createSale(businessId, userId, item, saleForm) {
  const quantity = Number(saleForm.quantity || 0);
  if (!item) throw new Error('Select a product to sell.');
  if (quantity <= 0) throw new Error('Quantity must be at least 1.');
  if (item.quantity < quantity) throw new Error('Insufficient stock for this sale.');

  const total = quantity * Number(item.selling_price || 0);
  const { error: saleError } = await supabase.from('sales').insert({
    business_id: businessId,
    stock_id: item.id,
    product_name: item.product_name,
    cylinder_size: item.cylinder_size,
    quantity,
    unit_price: Number(item.selling_price || 0),
    total_amount: total,
    payment_method: saleForm.payment_method,
    customer_name: saleForm.customer_name || '',
    sold_by: userId
  });

  if (saleError) throw saleError;

  const { error: stockError } = await supabase
    .from('stock')
    .update({ quantity: item.quantity - quantity })
    .eq('business_id', businessId)
    .eq('id', item.id);

  if (stockError) throw stockError;
}

export async function getDashboardSummary(businessId) {
  const [stock, sales] = await Promise.all([getStockItems(businessId), getSales(businessId)]);
  const totalSales = sum(sales, 'total_amount');
  const stockValue = stock.reduce((total, item) => total + Number(item.quantity || 0) * Number(item.selling_price || 0), 0);
  const cylindersAvailable = sum(stock, 'quantity');
  const lowStockItems = stock.filter((item) => Number(item.quantity) <= Number(item.low_stock_limit)).length;

  return {
    cards: {
      totalSales,
      transactionCount: sales.length,
      stockValue,
      cylindersAvailable,
      lowStockItems
    },
    latestSales: sales.slice(0, 8),
    salesTrend: groupRevenueByDate(sales).slice(-14),
    stockSummary: stock.map((item) => ({
      product_name: item.product_name,
      cylinder_size: item.cylinder_size,
      quantity: Number(item.quantity || 0)
    }))
  };
}

export async function getSalesReport(businessId) {
  const sales = await getSales(businessId);
  const revenue = sum(sales, 'total_amount');
  const unitsSold = sum(sales, 'quantity');

  return {
    summary: {
      revenue,
      units_sold: unitsSold,
      transactions: sales.length,
      average_sale: sales.length ? revenue / sales.length : 0
    },
    sales,
    revenueChart: groupRevenueByDate(sales).slice(-30),
    topProducts: getTopProducts(sales),
    recentTransactions: sales.slice(0, 10)
  };
}

export async function updateBusinessSettings(businessId, settings) {
  const { data, error } = await supabase
    .from('businesses')
    .update({
      business_name: settings.business_name,
      currency: settings.currency,
      receipt_footer: settings.receipt_footer || ''
    })
    .eq('id', businessId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBusinessUsers(businessId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

function withStockStatus(item) {
  return {
    ...item,
    status: Number(item.quantity) <= Number(item.low_stock_limit) ? 'Low Stock' : 'In Stock'
  };
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function groupRevenueByDate(sales) {
  const grouped = sales.reduce((acc, sale) => {
    const date = new Date(sale.created_at).toISOString().slice(0, 10);
    acc[date] = (acc[date] || 0) + Number(sale.total_amount || 0);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getTopProducts(sales) {
  const grouped = sales.reduce((acc, sale) => {
    const key = `${sale.product_name}-${sale.cylinder_size}`;
    if (!acc[key]) {
      acc[key] = {
        product_name: sale.product_name,
        cylinder_size: sale.cylinder_size,
        units: 0,
        revenue: 0
      };
    }
    acc[key].units += Number(sale.quantity || 0);
    acc[key].revenue += Number(sale.total_amount || 0);
    return acc;
  }, {});

  return Object.values(grouped)
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);
}
