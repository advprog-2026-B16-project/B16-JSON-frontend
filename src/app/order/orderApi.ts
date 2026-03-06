/**
 * ================================================================
 * ORDER MODULE — API SERVICE (Updated to match Java Backend DTO)
 * ================================================================
 */

// Trim trailing slash so URLs like `${BASE_URL}/orders` never become `//orders`
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api').replace(/\/$/, '');

// ─── Types ────────────────────────────────────────────────────────────────────

/** * Menyesuaikan dengan enum OrderStatus di Java
 */
export type OrderStatus =
    | 'PENDING'   // Ditambahkan sesuai contoh di DTO Java
    | 'PAID'
    | 'PURCHASED'
    | 'SHIPPED'
    | 'COMPLETED'
    | 'CANCELLED';

/**
 * Interface ini sekarang 1:1 dengan id.ac.ui.cs.advprog.jsonbackend.order.dto.OrderResponse
 */
export interface Order {
  orderId: string;            // Sebelumnya 'id'
  productId: string;          // Sebelumnya 'itemName' (Backend hanya kirim ID)
  titipersId: string;         // Sebelumnya 'buyerId'
  jastiperId: string;
  quantity: number;
  shippingAddress: string;
  orderStatus: OrderStatus;   // Sebelumnya 'status'
  createdAt: string;          // ISO String dari LocalDateTime
  updatedAt: string | null;
  jastiperRating: number | null;
  productRating: number | null;
  cancellationReason: string | null; // Field baru dari backend
}

export interface CheckoutPayload {
  productId: string; // Sesuaikan jika backend minta productId, bukan catalogueItemId
  quantity: number;
  shippingAddress: string;
}

export interface RatingPayload {
  jastiperRating: number;
  productRating: number;
  comment?: string; // Catatan: DTO backend belum menunjukkan field comment, pastikan ini disinkronkan nanti
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Java's LocalDateTime serializes WITHOUT @JsonFormat as a number array:
 *   [2025, 6, 1, 10, 0]  →  [year, month, day, hour, minute, (second?, nano?)]
 * This helper converts it to a proper ISO string that `new Date()` can parse.
 * If the backend is already sending an ISO string, it passes through unchanged.
 */
function normalizeDateTime(raw: unknown): string | null {
  if (!raw) return null;
  // Already a string (ISO format)
  if (typeof raw === 'string') return raw;
  // Java LocalDateTime array: [year, month, day, hour, minute] or longer
  if (Array.isArray(raw) && raw.length >= 5) {
    const [year, month, day, hour, minute, second = 0] = raw as number[];
    // month is 1-based from Java, Date needs 0-based
    return new Date(year, month - 1, day, hour, minute, second).toISOString();
  }
  return null;
}

/** Normalize a raw backend OrderResponse into our typed Order */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeOrder(raw: any): Order {
  return {
    ...raw,
    createdAt: normalizeDateTime(raw.createdAt) ?? '',
    updatedAt: normalizeDateTime(raw.updatedAt),
  } as Order;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

export async function getOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/orders`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
  const data = await res.json();
  return (data as unknown[]).map(normalizeOrder);
}

export async function getOrderById(id: string, token: string): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Failed to fetch order: ${res.status}`);
  return normalizeOrder(await res.json());
}

export async function createOrder(
    payload: CheckoutPayload,
    token: string,
): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Checkout failed: ${res.status}`);
  return normalizeOrder(await res.json());
}

export async function updateOrderStatus(
    id: string,
    status: OrderStatus,
    token: string,
): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ orderStatus: status }),
  });
  if (!res.ok) throw new Error(`Status update failed: ${res.status}`);
  return normalizeOrder(await res.json());
}

export async function cancelOrder(id: string, token: string): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders/${id}/cancel`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Cancel failed: ${res.status}`);
  return normalizeOrder(await res.json());
}

export async function submitRating(
    id: string,
    payload: RatingPayload,
    token: string,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/orders/${id}/rating`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Rating failed: ${res.status}`);
}