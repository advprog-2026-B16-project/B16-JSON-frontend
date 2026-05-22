'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ClipboardList, Loader2, MapPin, ShoppingCart, User } from 'lucide-react';
import { getOrders, type Order, type OrderStatus } from './orderApi';

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-400 text-black',
  PAID: 'bg-cyan-400 text-black',
  PURCHASED: 'bg-blue-400 text-white',
  SHIPPED: 'bg-purple-400 text-white',
  COMPLETED: 'bg-green-400 text-black',
  CANCELLED: 'bg-red-500 text-white',
};

const ACTIVE_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'PURCHASED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') ?? '' : '';
        const data = await getOrders(token);

        if (isMounted) {
          setOrders(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data pesanan.');
          setOrders([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeOrdersCount = useMemo(
    () => orders.filter((order) => ACTIVE_STATUSES.includes(order.orderStatus)).length,
    [orders],
  );

  const shippedCount = useMemo(
    () => orders.filter((order) => order.orderStatus === 'SHIPPED').length,
    [orders],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={64} aria-label="Loading orders" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center gap-4 border-4 border-black bg-red-100 p-6 shadow-[8px_8px_0px_0px_#000]">
          <AlertCircle className="text-red-600" size={32} />
          <div>
            <h1 className="text-2xl font-black uppercase text-red-600">Gagal memuat order</h1>
            <p className="font-bold text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 inline-block border-4 border-black bg-yellow-300 px-3 py-1 text-sm font-black uppercase shadow-[4px_4px_0px_0px_#000]">
            Modul Order
          </p>
          <h1 className="text-5xl font-black uppercase text-purple-600 md:text-6xl">Jastip Orders</h1>
          <p className="mt-4 max-w-2xl border-l-8 border-purple-400 bg-purple-50 px-4 py-3 text-lg font-bold">
            Pantau order aktif, status pengiriman, dan riwayat pesanan langsung dari backend.
          </p>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="border-4 border-black bg-white p-6 shadow-[12px_12px_0px_0px_#000]">
          <ShoppingCart className="mb-4 text-purple-600" size={40} />
          <h2 className="text-2xl font-black uppercase">Active Orders</h2>
          <p className="text-6xl font-black">{activeOrdersCount}</p>
        </div>
        <div className="border-4 border-black bg-white p-6 shadow-[12px_12px_0px_0px_#000]">
          <MapPin className="mb-4 text-cyan-500" size={40} />
          <h2 className="text-2xl font-black uppercase">On the Way</h2>
          <p className="text-6xl font-black">{shippedCount}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-black uppercase underline decoration-purple-400 decoration-8 underline-offset-8">
          Recent Orders
        </h2>

        {orders.length === 0 ? (
          <p className="border-4 border-black bg-white p-6 text-xl font-bold shadow-[8px_8px_0px_0px_#000]">
            Belum ada pesanan masuk.
          </p>
        ) : (
          orders.map((order) => (
            <article
              key={order.orderId}
              className="flex flex-col gap-5 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000] md:flex-row md:items-start md:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="border-2 border-black bg-purple-100 p-4 shadow-[4px_4px_0px_0px_#000]">
                  <ClipboardList size={32} className="text-purple-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase">Order #{order.orderId}</h3>
                  <p className="font-bold text-gray-700">Product ID: {order.productId}</p>
                  <div className="flex items-center gap-2 font-bold text-gray-700">
                    <User size={16} />
                    <span>{order.titipersId}</span>
                  </div>
                  <p className="font-bold text-gray-700">Quantity: {order.quantity}</p>
                  <p className="font-bold text-gray-700">Shipping: {order.shippingAddress}</p>
                  <p className="text-sm font-bold text-gray-500">Created at: {order.createdAt}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:items-end">
                <span
                  className={`inline-flex border-2 border-black px-4 py-1 text-sm font-black uppercase shadow-[4px_4px_0px_0px_#000] ${STATUS_STYLE[order.orderStatus]}`}
                >
                  {order.orderStatus}
                </span>
                {order.jastiperId ? (
                  <p className="text-sm font-bold text-gray-700">Jastiper: {order.jastiperId}</p>
                ) : (
                  <p className="text-sm font-bold text-gray-500">Jastiper belum ditentukan</p>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}