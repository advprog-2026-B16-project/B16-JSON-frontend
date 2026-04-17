'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, ShoppingCart, MapPin, User, AlertCircle, Loader2 } from 'lucide-react';

// Mendefinisikan tipe data sesuai dengan model Order di Spring Boot
interface Order {
  orderId: string;
  productId: string;
  titipersId: string;
  quantity: number;
  orderStatus: string;
  createdAt: string;
  // Note: Di sistem asli, nama buyer dan item idealnya dikirim via DTO dari backend.
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk mengambil data dari Spring Boot
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      // Sesuaikan port dengan port Spring Boot kamu (biasanya 8080)
      const response = await fetch('http://localhost:8080/api/orders');

      if (!response.ok) {
        throw new Error('Gagal mengambil data pesanan dari server');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect dijalankan sekali saat halaman pertama kali dimuat
  useEffect(() => {
    fetchOrders();
  }, []);

  // Logika pemetaan status (Nalar: Backend kirim teks ENUM, Frontend ubah jadi warna visual)
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-400 text-black';
      case 'PAID': return 'bg-cyan-400 text-black';
      case 'PURCHASED': return 'bg-blue-400 text-white';
      case 'SHIPPED': return 'bg-purple-400 text-white';
      case 'COMPLETED': return 'bg-green-400 text-black';
      case 'CANCELLED': return 'bg-red-500 text-white';
      default: return 'bg-gray-200 text-black';
    }
  };

  // Menghitung statistik dinamis berdasarkan data asli
  const activeOrdersCount = orders.filter(o => ['PENDING', 'PAID', 'PURCHASED'].includes(o.orderStatus)).length;
  const onTheWayCount = orders.filter(o => o.orderStatus === 'SHIPPED').length;

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin text-purple-600" size={64} />
        </div>
    );
  }

  if (error) {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-red-100 border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] flex items-center gap-4">
            <AlertCircle className="text-red-600" size={32} />
            <h3 className="text-xl font-black uppercase text-red-600">{error}</h3>
          </div>
        </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-6xl font-black uppercase mb-4 text-purple-600">Jastip Orders</h1>
            <p className="text-xl font-bold border-l-8 border-purple-400 pl-4 bg-purple-50 py-2">
              Track and manage your active jastip orders from buyers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-8 border-4 border-black bg-white shadow-[12px_12px_0px_0px_#000]">
            <ShoppingCart className="mb-4 text-purple-600" size={40} />
            <h3 className="text-2xl font-black uppercase">Active Orders</h3>
            <p className="text-6xl font-black">{activeOrdersCount}</p>
          </div>
          <div className="p-8 border-4 border-black bg-white shadow-[12px_12px_0px_0px_#000]">
            <MapPin className="mb-4 text-cyan-500" size={40} />
            <h3 className="text-2xl font-black uppercase">On the Way</h3>
            <p className="text-6xl font-black">{onTheWayCount}</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-black uppercase underline decoration-purple-400 decoration-8 underline-offset-8">Recent Orders</h2>

          {orders.length === 0 ? (
              <p className="text-xl font-bold border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000]">Belum ada pesanan masuk.</p>
          ) : (
              orders.map((order) => (
                  <div key={order.orderId} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="bg-purple-100 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                        <ClipboardList size={32} className="text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase overflow-hidden text-ellipsis max-w-xs">
                          Order #{order.orderId.substring(0, 8)}...
                        </h3>
                        {/* TODO: Ganti ini ketika Backend sudah memakai DTO */}
                        <p className="font-bold text-gray-600">Product ID: {order.productId}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <User size={16} />
                          <span className="text-sm font-bold italic overflow-hidden text-ellipsis max-w-[150px]">
                      {order.titipersId}
                    </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end w-full md:w-auto gap-4">
                <span className={`px-4 py-1 border-2 border-black font-black uppercase text-sm ${getStatusStyle(order.orderStatus)} shadow-[4px_4px_0px_0px_#000]`}>
                  {order.orderStatus}
                </span>
                      {order.orderStatus !== 'COMPLETED' && order.orderStatus !== 'CANCELLED' && (
                          <button className="bg-black text-white px-6 py-2 font-black uppercase hover:bg-purple-600 hover:text-white transition-colors border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                            Update Status
                          </button>
                      )}
                    </div>
                  </div>
              ))
          )}
        </div>
      </div>
  );
}