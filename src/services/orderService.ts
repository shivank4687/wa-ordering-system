import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from '../lib/db/jsonDb';
import type { Order, OrderItem, OrderStatus } from '../types/order';

const ORDERS_DB_PATH = 'data/orders.json';

type OrdersStore = Record<string, Order>;

const loadOrders = (): Promise<OrdersStore> => readJSON<OrdersStore>(ORDERS_DB_PATH);
const persistOrders = (orders: OrdersStore): Promise<OrdersStore> => writeJSON<OrdersStore>(ORDERS_DB_PATH, orders);

const calculateTotal = (items: OrderItem[]): number =>
  items.reduce((acc, item) => acc + item.price * item.qty, 0);

export const createOrder = async (phone: string, items: OrderItem[]): Promise<Order> => {
  const total = calculateTotal(items);
  const order: Order = {
    id: uuidv4(),
    phone,
    items,
    total,
    status: 'pending',
    createdAt: Date.now(),
  };

  const orders = await loadOrders();
  const updated: OrdersStore = { ...orders, [order.id]: order };
  await persistOrders(updated);
  return order;
};

export const getAllOrders = async (): Promise<Order[]> => {
  const orders = await loadOrders();
  return Object.values(orders);
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<Order> => {
  const orders = await loadOrders();
  const existing = orders[orderId];
  if (!existing) {
    throw new Error(`Order with id ${orderId} not found.`);
  }

  const updated: Order = { ...existing, status };
  const next: OrdersStore = { ...orders, [orderId]: updated };
  await persistOrders(next);
  return updated;
};
