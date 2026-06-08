'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, MapPin, Package, ReceiptText } from 'lucide-react';
import { PaymentService } from '@/services/payment/payment.service';
import { usePayments } from '@/hooks/payment/usePayments';
import { getOrderById, getOrderTotalAmount, type Order } from '../orderApi';
import { formatCompactDollar, formatDollar } from '@/lib/currency';
import { ConfirmModal } from '@/components/ConfirmModal';
import { getProducts } from '@/services/products/product.service';
import type { ProductDTO } from '@/types/api';
import { formatShortId } from '@/lib/ids';
import { ORDER_STATUS_DESCRIPTION, ORDER_STATUS_LABEL } from '@/lib/orderStatus';

const STATUS_STYLE = {
  PENDING: 'bg-yellow-300 text-black',
  PAID: 'bg-cyan-300 text-black',
  PURCHASED: 'bg-blue-400 text-white',
  SHIPPED: 'bg-purple-400 text-white',
  COMPLETED: 'bg-green-400 text-black',
  DONE: 'bg-emerald-500 text-white',
  CANCELLED: 'bg-red-500 text-white',
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;
  const { payments, fetchPayments, isLoading: paymentsLoading } = usePayments();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProceeding, setIsProceeding] = useState(false);
  const [error, setError] = useState('');
  const [isProceedConfirmOpen, setIsProceedConfirmOpen] = useState(false);
  const [products, setProducts] = useState<ProductDTO[]>([]);

  const activePayment = payments.find((item) => {
    if (item.orderId !== orderId) return false;
    if (item.status !== 'PENDING') return item.status === 'SUCCESS';
    return !item.expiresAt || Date.now() < new Date(item.expiresAt).getTime();
  });
  const expiredPayment = payments.find((item) => item.orderId === orderId && item.status === 'PENDING' && item.expiresAt && Date.now() >= new Date(item.expiresAt).getTime());
  const cancelledPayment = payments.find((item) => item.orderId === orderId && item.status === 'CANCELLED');
  const paymentLocked = Boolean(order?.orderStatus === 'CANCELLED' || expiredPayment);
  const product = useMemo(
    () => products.find((item) => item.id === order?.productId) || null,
    [products, order?.productId],
  );
  const unitPrice = product?.price || 0;
  const totalAmount = order
    ? getOrderTotalAmount(order) || activePayment?.amount || expiredPayment?.amount || unitPrice * order.quantity
    : 0;

  useEffect(() => {
    async function loadOrder() {
      setIsLoading(true);
      setError('');
      try {
        const [orderResult, productResult] = await Promise.allSettled([getOrderById(orderId), getProducts()]);
        if (orderResult.status === 'rejected') throw orderResult.reason;
        setOrder(orderResult.value);
        if (productResult.status === 'fulfilled') setProducts(productResult.value);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrder();
  }, [orderId]);

  async function handleProceedPayment() {
    if (!order || paymentLocked) return;
    setIsProceeding(true);
    setError('');
    try {
      if (!activePayment) {
        await PaymentService.createPayment({ orderId: order.orderId });
        await fetchPayments();
      }
      router.push('/dashboard/transactions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
    } finally {
      setIsProceeding(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={64} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12 text-black">
        <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 font-black uppercase">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="border-4 border-black bg-red-100 p-8 font-black shadow-[8px_8px_0px_0px_#000]">
          {error || 'Order not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 text-black">
      <button
        onClick={() => router.push('/dashboard/marketplace')}
        className="mb-8 flex items-center gap-2 border-4 border-black bg-white px-4 py-2 font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:bg-gray-100"
      >
        <ArrowLeft size={20} /> Marketplace
      </button>

      <div className="mb-10 border-4 border-black bg-green-100 p-8 shadow-[12px_12px_0px_0px_#000]">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]">
              <CheckCircle2 size={16} /> Order Created
            </p>
            <h1 className="text-4xl font-black uppercase md:text-6xl">Order #{formatShortId(order.orderId)}</h1>
            <p className="mt-3 max-w-2xl font-bold text-gray-700">
              {ORDER_STATUS_DESCRIPTION[order.orderStatus]}
            </p>
          </div>
          <span className={`w-fit border-2 border-black px-4 py-2 text-sm font-black uppercase shadow-[4px_4px_0px_0px_#000] ${STATUS_STYLE[order.orderStatus]}`}>
            {ORDER_STATUS_LABEL[order.orderStatus]}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-8 border-4 border-black bg-red-100 p-5 font-black shadow-[6px_6px_0px_0px_#000]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <section className="border-4 border-black bg-white p-8 shadow-[10px_10px_0px_0px_#000]">
          <div className="mb-6 flex items-center gap-3 border-b-4 border-black pb-4">
            <Package className="text-green-600" size={28} />
            <h2 className="text-3xl font-black uppercase">Order Detail</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Detail label="Product" value={product?.name || `Product ${formatShortId(order.productId)}`} />
            <Detail label="Order ID" value={formatShortId(order.orderId)} title={order.orderId} mono />
            <Detail label="Jastiper" value={formatShortId(order.jastiperId)} title={order.jastiperId || 'N/A'} mono />
            <Detail label="Quantity" value={String(order.quantity)} />
            <Detail label="Price / Item" value={unitPrice ? formatDollar(unitPrice) : 'N/A'} highlight={Boolean(unitPrice)} />
            <Detail label="Total" value={formatDollar(totalAmount)} highlight />
            <div className="md:col-span-2">
              <p className="mb-1 text-xs font-black uppercase text-gray-500">Shipping Address</p>
              <div className="flex gap-2 border-2 border-black bg-yellow-50 p-4 font-bold">
                <MapPin size={18} className="mt-1 shrink-0" />
                <span>{order.shippingAddress}</span>
              </div>
            </div>
          </div>
        </section>

        <aside className="border-4 border-black bg-yellow-100 p-6 shadow-[10px_10px_0px_0px_#000]">
          <div className="mb-5 flex items-center gap-3">
            <ReceiptText size={28} />
            <h2 className="text-2xl font-black uppercase">Next Step</h2>
          </div>
          <p className="mb-5 text-sm font-bold text-gray-700">
            {order.orderStatus === 'CANCELLED'
              ? 'This order has been cancelled and cannot continue to payment.'
              : activePayment
              ? `Payment ${activePayment.referenceCode} already exists with ${activePayment.status === 'PENDING' ? 'UNPAID' : activePayment.status} status.`
              : expiredPayment
                ? 'Previous payment expired. Refresh this page after the backend cancels the order.'
              : cancelledPayment
                ? `Previous payment ${cancelledPayment.referenceCode} was cancelled. Create a fresh unpaid transaction for ${formatCompactDollar(totalAmount)}.`
              : `Create an unpaid transaction for ${formatCompactDollar(totalAmount)}.`}
          </p>
          <button
            disabled={isProceeding || paymentsLoading || paymentLocked}
            onClick={() => setIsProceedConfirmOpen(true)}
            className="flex w-full items-center justify-center gap-2 border-4 border-black bg-black px-5 py-4 text-lg font-black uppercase text-white shadow-[4px_4px_0px_0px_#000] hover:bg-green-400 hover:text-black disabled:opacity-60"
          >
            {isProceeding ? <Loader2 className="animate-spin" /> : <CreditCard />}
            Proceed to Payment
          </button>
        </aside>
      </div>
      <ConfirmModal
        open={isProceedConfirmOpen}
        title="Proceed to Payment?"
        message={
          order.orderStatus === 'CANCELLED'
            ? 'This order has been cancelled and cannot continue to payment.'
            : expiredPayment
              ? 'Previous payment expired. This order is no longer payable.'
            : activePayment
              ? 'Open your existing payment transaction.'
              : `Create an unpaid transaction for ${formatDollar(totalAmount)}.`
        }
        confirmText="Proceed"
        confirmClassName="bg-green-400 text-black hover:bg-green-500"
        isLoading={isProceeding}
        onCancel={() => setIsProceedConfirmOpen(false)}
        onConfirm={async () => {
          await handleProceedPayment();
          setIsProceedConfirmOpen(false);
        }}
      />
    </div>
  );
}

function Detail({
  label,
  value,
  title,
  highlight = false,
  mono = false,
}: {
  label: string;
  value: string;
  title?: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 border-2 border-black bg-gray-50 p-4">
      <p className="mb-1 text-xs font-black uppercase text-gray-500">{label}</p>
      <p className={`truncate font-black ${highlight ? 'text-2xl text-green-600' : ''} ${mono ? 'font-mono text-sm' : ''}`} title={title || value}>
        {value}
      </p>
    </div>
  );
}
