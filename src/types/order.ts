export type OrderItem = {
  productId: string;
  name: string;
  qty: number;
  price: number;
};

export type OrderStatus = 'pending' | 'paid' | 'completed';

export type Order = {
  id: string;
  phone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
};
