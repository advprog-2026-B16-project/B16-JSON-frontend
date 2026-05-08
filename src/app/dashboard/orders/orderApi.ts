const API_URL = '/api/proxy';

export type OrderStatus = 'PENDING' | 'PAID' | 'PURCHASED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface Order {
    orderId: string;
    productId: string;
    titipersId: string;
    jastiperId?: string | null;
    quantity: number;
    totalAmount?: number | null;
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
    quantity: number;
    shippingAddress: string;
}

export interface RatingPayload {
    jastiperRating: number;
    productRating: number;
}

const getHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export async function getOrders(token: string): Promise<Order[]> {
    const res = await fetch(`${API_URL}/orders`, {
        method: 'GET',
        headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Gagal mengambil daftar pesanan');
    return res.json();
}

export async function createOrder(payload: CheckoutPayload, token: string): Promise<Order> {
    const res = await fetch(`${API_URL}/orders/checkout`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Gagal melakukan checkout pesanan');
    return res.json();
}

export async function cancelOrder(orderId: string, token: string, reason: string = 'Dibatalkan oleh pengguna'): Promise<Order> {
    const url = new URL(`${window.location.origin}${API_URL}/orders/${orderId}/cancel`);
    url.searchParams.append('cancellationReason', reason);

    const res = await fetch(url.toString(), {
        method: 'PATCH',
        headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Gagal membatalkan pesanan');
    return res.json();
}

export async function submitRating(orderId: string, payload: RatingPayload, token: string): Promise<Order> {
    const res = await fetch(`${API_URL}/orders/${orderId}/rating`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Gagal mengirim penilaian');
    return res.json();
}

export async function updateOrderStatus(orderId: string, nextStatus: OrderStatus, token: string): Promise<Order> {
    const res = await fetch(`${API_URL}/orders/${orderId}/status?status=${nextStatus}`, {
        method: 'PATCH',
        headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Gagal memperbarui status pesanan');
    return res.json();
}