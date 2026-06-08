import { apiFetch } from '@/lib/api';
import { expectJson, getErrorMessage, readJson } from '@/lib/http';

export type OrderStatus = 'PENDING' | 'PAID' | 'PURCHASED' | 'SHIPPED' | 'COMPLETED' | 'DONE' | 'CANCELLED';

export interface Order {
  orderId: string;
  productId: string;
  titipersId: string;
  jastiperId?: string | null;
  quantity: number;
  totalAmount?: number | string | null;
  totalPrice?: number | string | null;
  total_amount?: number | string | null;
  total_price?: number | string | null;
  amount?: number | string | null;
  jastiperIncome?: number | string | null;
  jastiper_income?: number | string | null;
  income?: number | string | null;
  shippingAddress: string;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt?: string | null;
  jastiperRating?: number | null;
  productRating?: number | null;
  cancellationReason?: string | null;
}

export interface CheckoutPayload {
  productId: string;
  titipersId: string;
  jastiperId: string;
  quantity: number;
  shippingAddress: string;
}

export interface RatingPayload {
  jastiperRating: number;
  productRating: number;
}

async function expectOk<T>(response: Response, fallback: string): Promise<T> {
  return expectJson<T>(response, fallback);
}

export async function getOrders(): Promise<Order[]> {
  const response = await apiFetch('/orders', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to fetch orders'));
  }

  return (await readJson<Order[]>(response)) || [];
}

export async function getOrdersByTitipersId(titipersId: string): Promise<Order[]> {
  const response = await apiFetch(`/orders/titipers/${titipersId}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to fetch buyer orders'));
  }

  return (await readJson<Order[]>(response)) || [];
}

export async function getOrdersByJastiperId(jastiperId: string): Promise<Order[]> {
  const response = await apiFetch(`/orders/jastiper/${jastiperId}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to fetch Jastiper orders'));
  }

  return (await readJson<Order[]>(response)) || [];
}

export async function getMyJastiperOrders(): Promise<Order[]> {
  const response = await apiFetch('/jastiper/orders/me', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to fetch Jastiper orders'));
  }

  return (await readJson<Order[]>(response)) || [];
}

export async function getOrderById(orderId: string): Promise<Order> {
  const response = await apiFetch(`/orders/${orderId}`, { cache: 'no-store' });
  return expectOk<Order>(response, 'Failed to fetch order');
}

export async function createOrder(payload: CheckoutPayload): Promise<Order> {
  const response = await apiFetch('/orders/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return expectOk<Order>(response, 'Failed to checkout order');
}

export async function cancelOrder(orderId: string, reason = 'Cancelled by Jastiper'): Promise<Order> {
  const params = new URLSearchParams({ cancellationReason: reason });
  const response = await apiFetch(`/orders/${orderId}/cancel?${params.toString()}`, {
    method: 'PATCH',
  });

  return expectOk<Order>(response, 'Failed to cancel order');
}

export async function submitRating(orderId: string, payload: RatingPayload): Promise<Order> {
  const response = await apiFetch(`/orders/${orderId}/rating`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return expectOk<Order>(response, 'Failed to submit rating');
}

export async function updateOrderStatus(orderId: string, nextStatus: OrderStatus): Promise<Order> {
  const params = new URLSearchParams({ status: nextStatus });
  const response = await apiFetch(`/orders/${orderId}/status?${params.toString()}`, {
    method: 'PATCH',
  });

  return expectOk<Order>(response, 'Failed to update order status');
}

export async function markJastiperOrderShipped(orderId: string): Promise<Order> {
  const response = await apiFetch(`/jastiper/orders/${orderId}/shipped`, {
    method: 'PATCH',
  });

  return expectOk<Order>(response, 'Failed to mark order as shipped');
}

export async function markJastiperOrderCompleted(orderId: string): Promise<Order> {
  const response = await apiFetch(`/jastiper/orders/${orderId}/completed`, {
    method: 'PATCH',
  });

  return expectOk<Order>(response, 'Failed to mark order as completed');
}

export async function markTitiperOrderDone(orderId: string): Promise<Order> {
  const response = await apiFetch(`/titiper/orders/${orderId}/done`, {
    method: 'PATCH',
  });

  return expectOk<Order>(response, 'Failed to confirm order as done');
}

function toFiniteNumber(raw: number | string | null | undefined): number {
  const value = typeof raw === 'string' ? Number(raw) : raw;
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function getOrderTotalAmount(order: Pick<Order, 'totalAmount' | 'totalPrice' | 'total_amount' | 'total_price' | 'amount'>) {
  const raw = order.totalAmount ?? order.totalPrice ?? order.total_amount ?? order.total_price ?? order.amount ?? 0;
  return toFiniteNumber(raw);
}

export function getOrderIncomeAmount(order: Pick<Order, 'jastiperIncome' | 'jastiper_income' | 'income' | 'totalAmount' | 'totalPrice' | 'total_amount' | 'total_price' | 'amount'>) {
  const raw = order.jastiperIncome ?? order.jastiper_income ?? order.income;
  return raw == null ? getOrderTotalAmount(order) : toFiniteNumber(raw);
}
