'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, ClipboardList, CheckCircle, XCircle,
  Package, Truck, ChevronRight, Star, X, RefreshCw,
  Eye, MapPin, User, AlertCircle, Plus,
} from 'lucide-react';
import {
  getOrders, createOrder, updateOrderStatus, cancelOrder, submitRating,
  Order, OrderStatus, CheckoutPayload, RatingPayload,
} from './orderApi';

// ─── Constants (sesuai enum Java OrderStatus) ─────────────────────────────────

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:   'Pending',
  PAID:      'Paid',
  PURCHASED: 'Purchased',
  SHIPPED:   'Shipped',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING:   'bg-gray-200',
  PAID:      'bg-yellow-300',
  PURCHASED: 'bg-blue-300',
  SHIPPED:   'bg-cyan-400',
  COMPLETED: 'bg-green-400',
  CANCELLED: 'bg-red-400',
};

// Urutan status yang bisa di-advance oleh Jastiper (validasi utama ada di backend)
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING:   'PAID',
  PAID:      'PURCHASED',
  PURCHASED: 'SHIPPED',
  SHIPPED:   'COMPLETED',
};

// ─── Small reusable pieces ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`px-3 py-1 border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] ${STATUS_COLOR[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function StatusTimeline({ status }: { status: OrderStatus }) {
  const steps: OrderStatus[] = ['PENDING', 'PAID', 'PURCHASED', 'SHIPPED', 'COMPLETED'];

  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 mt-2">
        <XCircle size={14} className="text-red-500 shrink-0" />
        <span className="text-xs font-bold text-red-600 uppercase">
          Dibatalkan — Refund dikirim ke saldo Titiper
        </span>
      </div>
    );
  }

  const current = steps.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-2 flex-wrap">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          <span
            className={`flex items-center gap-1 px-2 py-0.5 border-2 border-black text-xs font-black uppercase ${
              i <= current ? STATUS_COLOR[step] : 'bg-gray-100 text-gray-400'
            }`}
          >
            {i < current && <CheckCircle size={9} />}
            {STATUS_LABEL[step]}
          </span>
          {i < steps.length - 1 && (
            <ChevronRight size={11} className={i < current ? 'text-black' : 'text-gray-300'} />
          )}
        </div>
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`text-2xl transition-transform hover:scale-110 active:scale-95 ${
            s <= value ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function CheckoutModal({
  onClose,
  onSubmit,
  loading,
}: {
  onClose: () => void;
  onSubmit: (p: CheckoutPayload) => void;
  loading: boolean;
}) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-md bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000]"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b-4 border-black p-5 bg-yellow-300">
          <h2 className="text-xl font-black uppercase flex items-center gap-2">
            <ShoppingCart size={20} /> Checkout Pesanan
          </h2>
          <button onClick={onClose} className="border-2 border-black p-1 bg-white hover:bg-red-400 transition-colors">
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Form */}
        <form
          className="p-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ productId, quantity, shippingAddress });
          }}
        >
          <div>
            <label className="block font-black uppercase text-xs mb-1">Product ID</label>
            <input
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="e.g. prod-456"
              className="w-full border-4 border-black p-3 font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-shadow"
            />
            <p className="text-xs text-gray-400 mt-1 font-bold">
              productId dari Modul Catalogue / Inventory
            </p>
          </div>

          <div>
            <label className="block font-black uppercase text-xs mb-1">Jumlah (quantity)</label>
            <input
              required
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border-4 border-black p-3 font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-shadow"
            />
          </div>

          <div>
            <label className="block font-black uppercase text-xs mb-1">Alamat Pengiriman</label>
            <textarea
              required
              rows={3}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Jl. Contoh No.1, Jakarta"
              className="w-full border-4 border-black p-3 font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-shadow resize-none"
            />
          </div>

          <div className="border-l-4 border-yellow-400 pl-3 bg-yellow-50 py-2">
            <p className="text-xs font-bold text-gray-600">
              ⚡ Sistem akan otomatis memverifikasi <strong>stok (Inventory)</strong> dan{' '}
              <strong>saldo (Wallet)</strong> sebelum pesanan dikonfirmasi.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 font-black uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-yellow-300 hover:text-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><RefreshCw size={16} className="animate-spin" /> Memproses...</>
            ) : (
              <><CheckCircle size={16} /> Konfirmasi & Bayar</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function RatingModal({
  order,
  onClose,
  onSubmit,
  loading,
}: {
  order: Order;
  onClose: () => void;
  onSubmit: (p: RatingPayload) => void;
  loading: boolean;
}) {
  const [jastiperRating, setJastiperRating] = useState(0);
  const [productRating, setProductRating] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-md bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000]"
      >
        <div className="flex justify-between items-center border-b-4 border-black p-5 bg-green-300">
          <h2 className="text-xl font-black uppercase flex items-center gap-2">
            <Star size={20} /> Beri Penilaian
          </h2>
          <button onClick={onClose} className="border-2 border-black p-1 bg-white hover:bg-red-400 transition-colors">
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        <form
          className="p-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!jastiperRating || !productRating) return;
            onSubmit({ jastiperRating, productRating });
          }}
        >
          <p className="font-bold text-sm text-gray-600">
            Order <span className="font-black text-black">{order.orderId}</span> —{' '}
            Product ID: {order.productId}
          </p>

          <div>
            <label className="block font-black uppercase text-xs mb-2">
              Rating Jastiper (ID: {order.jastiperId || '—'})
            </label>
            <StarPicker value={jastiperRating} onChange={setJastiperRating} />
            <p className="text-xs text-gray-400 mt-1 font-bold">
              Dikirim ke Modul Profil → reputasi Jastiper
            </p>
          </div>

          <div>
            <label className="block font-black uppercase text-xs mb-2">
              Rating Kualitas Produk
            </label>
            <StarPicker value={productRating} onChange={setProductRating} />
            <p className="text-xs text-gray-400 mt-1 font-bold">
              Dikirim ke Modul Profil → rating produk
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !jastiperRating || !productRating}
            className="w-full bg-black text-white py-4 font-black uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-green-300 hover:text-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><RefreshCw size={16} className="animate-spin" /> Mengirim...</>
            ) : (
              <><Star size={16} /> Kirim Penilaian</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function DetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const rows: [string, string][] = [
    ['Order ID',   order.orderId],
    ['Product ID', order.productId],
    ['Titipers ID', order.titipersId],
    ['Jastiper ID', order.jastiperId ?? '—'],
    ['Jumlah',     String(order.quantity)],
    ['Dibuat',     new Date(order.createdAt).toLocaleString('id-ID')],
    ['Diupdate',   order.updatedAt ? new Date(order.updatedAt).toLocaleString('id-ID') : '—'],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-md bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b-4 border-black p-5 bg-cyan-300 sticky top-0">
          <h2 className="text-xl font-black uppercase flex items-center gap-2">
            <Eye size={20} /> Detail Order
          </h2>
          <button onClick={onClose} className="border-2 border-black p-1 bg-white hover:bg-red-400 transition-colors">
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2">
            {rows.map(([label, val]) => (
              <div key={label} className="border-2 border-black p-3">
                <p className="text-xs font-black uppercase text-gray-400">{label}</p>
                <p className="font-bold text-sm mt-0.5 break-all">{val}</p>
              </div>
            ))}
            <div className="col-span-2 border-2 border-black p-3">
              <p className="text-xs font-black uppercase text-gray-400">Alamat Pengiriman</p>
              <p className="font-bold text-sm mt-0.5">{order.shippingAddress}</p>
            </div>
            {order.cancellationReason && (
              <div className="col-span-2 border-2 border-red-400 bg-red-50 p-3">
                <p className="text-xs font-black uppercase text-red-400">Alasan Pembatalan</p>
                <p className="font-bold text-sm mt-0.5 text-red-700">{order.cancellationReason}</p>
              </div>
            )}
          </div>

          {/* Status + timeline */}
          <div className="border-4 border-black p-4 bg-gray-50">
            <p className="text-xs font-black uppercase mb-2">Status Pesanan</p>
            <StatusBadge status={order.orderStatus} />
            <StatusTimeline status={order.orderStatus} />
          </div>

          {/* Rating */}
          {(order.jastiperRating !== null || order.productRating !== null) && (
            <div className="border-4 border-black p-4 bg-yellow-50">
              <p className="text-xs font-black uppercase mb-2">Penilaian</p>
              {order.jastiperRating !== null && (
                <p className="text-sm font-bold">
                  Jastiper:{' '}
                  <span className="text-yellow-500">
                    {'★'.repeat(order.jastiperRating)}{'☆'.repeat(5 - order.jastiperRating)}
                  </span>
                </p>
              )}
              {order.productRating !== null && (
                <p className="text-sm font-bold">
                  Produk:{' '}
                  <span className="text-yellow-500">
                    {'★'.repeat(order.productRating)}{'☆'.repeat(5 - order.productRating)}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  role,
  actionLoadingId,
  onAdvance,
  onCancel,
  onRate,
  onDetail,
}: {
  order: Order;
  role: string;
  actionLoadingId: string | null;
  onAdvance: (id: string, next: OrderStatus) => void;
  onCancel: (id: string) => void;
  onRate: (order: Order) => void;
  onDetail: (order: Order) => void;
}) {
  const next = NEXT_STATUS[order.orderStatus];
  const isLoading = actionLoadingId === order.orderId;
  const isJastiper = role === 'JASTIPER';
  const isTitiper = role === 'TITIPER';
  const canCancel = isJastiper && (order.orderStatus === 'PENDING' || order.orderStatus === 'PAID' || order.orderStatus === 'PURCHASED');
  const canRate = isTitiper && order.orderStatus === 'COMPLETED' && order.jastiperRating === null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-4 border-black p-5 shadow-[8px_8px_0px_0px_#000]"
    >
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* ── Info ── */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="shrink-0 border-2 border-black p-3 bg-purple-100 shadow-[3px_3px_0px_0px_#000]">
            <ClipboardList size={26} className="text-purple-600" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-black text-lg uppercase">#{order.orderId}</span>
              <StatusBadge status={order.orderStatus} />
            </div>
            <p className="font-bold text-sm text-gray-500">
              Product ID: <span className="text-black">{order.productId}</span>
            </p>
            <p className="text-sm font-bold text-gray-500">Qty: {order.quantity}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm font-bold text-gray-500">
              <span className="flex items-center gap-1">
                <User size={13} />
                {isJastiper
                  ? `Titipers: ${order.titipersId}`
                  : `Jastiper: ${order.jastiperId || 'Pending'}`}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                <span className="truncate max-w-45">{order.shippingAddress}</span>
              </span>
            </div>
            <StatusTimeline status={order.orderStatus} />

            {order.cancellationReason && (
              <p className="mt-2 text-xs font-bold text-red-600 border border-red-300 bg-red-50 px-2 py-0.5">
                Alasan: {order.cancellationReason}
              </p>
            )}
            {order.jastiperRating !== null && (
              <span className="mt-2 inline-block text-xs font-bold text-yellow-600 border border-yellow-400 bg-yellow-50 px-2 py-0.5">
                Rated ★{order.jastiperRating} / ★{order.productRating}
              </span>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-row md:flex-col gap-2 shrink-0 flex-wrap md:items-end">
          <p className="w-full text-xs font-bold text-gray-400 md:text-right hidden md:block">
            {new Date(order.createdAt).toLocaleDateString('id-ID')}
          </p>

          <button
            onClick={() => onDetail(order)}
            className="flex items-center gap-1 border-2 border-black px-3 py-2 text-xs font-black uppercase bg-white hover:bg-gray-100 shadow-[3px_3px_0px_0px_#000] active:translate-x-px active:translate-y-px active:shadow-none transition-all"
          >
            <Eye size={13} /> Detail
          </button>

          {isJastiper && next && order.orderStatus !== 'CANCELLED' && (
            <button
              disabled={isLoading}
              onClick={() => onAdvance(order.orderId, next)}
              className="flex items-center gap-1 border-2 border-black px-3 py-2 text-xs font-black uppercase bg-black text-white hover:bg-purple-400 shadow-[3px_3px_0px_0px_#000] active:translate-x-px active:translate-y-px active:shadow-none transition-all disabled:opacity-50"
            >
              {isLoading
                ? <RefreshCw size={13} className="animate-spin" />
                : <><ChevronRight size={13} /> {STATUS_LABEL[next]}</>}
            </button>
          )}

          {canCancel && (
            <button
              disabled={isLoading}
              onClick={() => onCancel(order.orderId)}
              className="flex items-center gap-1 border-2 border-black px-3 py-2 text-xs font-black uppercase bg-red-400 hover:bg-red-500 shadow-[3px_3px_0px_0px_#000] active:translate-x-px active:translate-y-px active:shadow-none transition-all disabled:opacity-50"
            >
              <XCircle size={13} /> Batalkan
            </button>
          )}

          {canRate && (
            <button
              onClick={() => onRate(order)}
              className="flex items-center gap-1 border-2 border-black px-3 py-2 text-xs font-black uppercase bg-yellow-300 hover:bg-yellow-400 shadow-[3px_3px_0px_0px_#000] active:translate-x-px active:translate-y-px active:shadow-none transition-all"
            >
              <Star size={13} /> Nilai
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrderPage() {
  const [role, setRole] = useState('TITIPER');
  const [token, setToken] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCheckout, setShowCheckout] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<Order | null>(null);
  const [detailTarget, setDetailTarget] = useState<Order | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('auth_token') ?? '';
    const r = localStorage.getItem('user_role') ?? 'TITIPER';
    setToken(t);
    setRole(r);
    loadOrders(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOrders(t: string) {
    setPageLoading(true);
    setError(null);
    try {
      const data = await getOrders(t);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat pesanan dari server.');
      setOrders([]);
    } finally {
      setPageLoading(false);
    }
  }

  async function handleCheckout(payload: CheckoutPayload) {
    setCheckoutLoading(true);
    setError(null);
    try {
      const newOrder = await createOrder(payload, token);
      setOrders((prev) => [newOrder, ...prev]);
      setShowCheckout(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout gagal.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleAdvance(orderId: string, next: OrderStatus) {
    setActionLoadingId(orderId);
    setError(null);
    try {
      const updated = await updateOrderStatus(orderId, next, token);
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updated : o)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal update status.');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleCancel(orderId: string) {
    if (!confirm('Batalkan pesanan ini? Refund akan otomatis dikirim ke saldo Titiper.')) return;
    setActionLoadingId(orderId);
    setError(null);
    try {
      const updated = await cancelOrder(orderId, token);
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updated : o)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membatalkan pesanan.');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRating(payload: RatingPayload) {
    if (!ratingTarget) return;
    setRatingLoading(true);
    setError(null);
    try {
      await submitRating(ratingTarget.orderId, payload, token);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === ratingTarget.orderId
            ? { ...o, jastiperRating: payload.jastiperRating, productRating: payload.productRating }
            : o,
        ),
      );
      setRatingTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim penilaian.');
    } finally {
      setRatingLoading(false);
    }
  }

  const filtered = filterStatus === 'ALL'
    ? orders
    : orders.filter((o) => o.orderStatus === filterStatus);

  const stats = {
    active:    orders.filter((o) => ['PENDING','PAID','PURCHASED','SHIPPED'].includes(o.orderStatus)).length,
    completed: orders.filter((o) => o.orderStatus === 'COMPLETED').length,
    cancelled: orders.filter((o) => o.orderStatus === 'CANCELLED').length,
    total:     orders.length,
  };

  const isJastiper = role === 'JASTIPER';
  const isAdmin    = role === 'ADMIN';
  const isTitiper  = !isJastiper && !isAdmin;
  const filterOptions: Array<OrderStatus | 'ALL'> = ['ALL','PENDING','PAID','PURCHASED','SHIPPED','COMPLETED','CANCELLED'];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
            Modul Order — JSON Ecosystem
          </p>
          <h1 className="text-5xl font-black uppercase leading-none mb-3">
            {isAdmin ? '🛡 Order Monitor' : isJastiper ? '📦 Pesanan Saya' : '🛒 Pesanan Saya'}
          </h1>
          <p className="text-base font-bold border-l-8 border-black pl-4 bg-gray-50 py-2 max-w-xl">
            {isAdmin
              ? 'Pantau seluruh transaksi berjalan di platform JSON.'
              : isJastiper
              ? 'To-do list pesanan yang harus kamu proses sebagai Jastiper.'
              : 'Riwayat belanja dan status pesanan aktifmu.'}
          </p>
        </div>
        {isTitiper && (
          <button
            onClick={() => setShowCheckout(true)}
            className="flex items-center gap-2 bg-black text-white px-6 py-4 font-black uppercase border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:bg-yellow-300 hover:text-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Plus size={20} strokeWidth={3} /> Checkout Order
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {(
          [
            { label: 'Aktif',      value: stats.active,    icon: <Package size={22} />,       color: 'bg-yellow-300' },
            { label: 'Selesai',    value: stats.completed, icon: <CheckCircle size={22} />,   color: 'bg-green-300'  },
            { label: 'Dibatalkan', value: stats.cancelled, icon: <XCircle size={22} />,       color: 'bg-red-300'    },
            { label: 'Total',      value: stats.total,     icon: <ClipboardList size={22} />, color: 'bg-cyan-300'   },
          ] as const
        ).map(({ label, value, icon, color }) => (
          <div key={label} className={`p-5 border-4 border-black ${color} shadow-[6px_6px_0px_0px_#000]`}>
            <div className="bg-white/60 border-2 border-black p-1 inline-block mb-3">{icon}</div>
            <p className="text-xs font-black uppercase text-gray-600">{label}</p>
            <p className="text-4xl font-black">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`px-4 py-3 border-4 border-black font-black uppercase text-sm whitespace-nowrap transition-all ${
              filterStatus === f
                ? 'bg-black text-white translate-x-1 translate-y-1 shadow-none'
                : 'bg-white shadow-[4px_4px_0px_0px_#000] hover:bg-gray-50'
            }`}
          >
            {f === 'ALL' ? `Semua (${stats.total})` : STATUS_LABEL[f as OrderStatus]}
          </button>
        ))}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-3 border-4 border-red-500 bg-red-50 p-4 mb-6 font-bold shadow-[4px_4px_0px_0px_#ef4444]">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto border-2 border-red-400 px-2 py-0.5 text-xs hover:bg-red-100">
            Tutup
          </button>
        </div>
      )}

      {/* ── Order list ── */}
      {pageLoading ? (
        <div className="py-24 text-center text-2xl font-black animate-pulse">Memuat pesanan...</div>
      ) : filtered.length === 0 ? (
        <div className="border-4 border-black bg-gray-50 p-16 text-center shadow-[8px_8px_0px_0px_#000]">
          <Truck size={56} className="mx-auto mb-4 text-gray-300" />
          <p className="text-2xl font-black uppercase text-gray-400 mb-2">Tidak ada pesanan</p>
          {isTitiper && (
            <button
              onClick={() => setShowCheckout(true)}
              className="mt-4 bg-black text-white px-8 py-3 font-black uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-yellow-300 hover:text-black transition-all"
            >
              Buat Pesanan Pertamamu
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              role={role}
              actionLoadingId={actionLoadingId}
              onAdvance={handleAdvance}
              onCancel={handleCancel}
              onRate={setRatingTarget}
              onDetail={setDetailTarget}
            />
          ))}
        </div>
      )}

      {/* ── Integration cheatsheet ── */}
      <div className="mt-14 border-4 border-black bg-blue-50 p-6 shadow-[6px_6px_0px_0px_#000]">
        <p className="font-black uppercase text-sm mb-3 border-b-2 border-black pb-2">
          🔌 Backend Integration — orderApi.ts
        </p>
        <ul className="text-sm font-bold space-y-1.5 text-gray-700 list-disc list-inside">
          <li><code>GET /orders</code> → <code>OrderResponse[]</code></li>
          <li><code>POST /orders</code> → checkout (productId, quantity, shippingAddress)</li>
          <li><code>PATCH /orders/:orderId/status</code> → advance orderStatus</li>
          <li><code>PATCH /orders/:orderId/cancel</code> → cancel + refund Wallet</li>
          <li><code>POST /orders/:orderId/rating</code> → jastiperRating + productRating</li>
        </ul>
        <p className="text-xs text-gray-400 mt-4 font-bold">
          Set <code>NEXT_PUBLIC_API_URL=http://localhost:8080/api</code> di <code>.env.local</code>
        </p>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal
            onClose={() => setShowCheckout(false)}
            onSubmit={handleCheckout}
            loading={checkoutLoading}
          />
        )}
        {ratingTarget && (
          <RatingModal
            order={ratingTarget}
            onClose={() => setRatingTarget(null)}
            onSubmit={handleRating}
            loading={ratingLoading}
          />
        )}
        {detailTarget && (
          <DetailModal order={detailTarget} onClose={() => setDetailTarget(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}


