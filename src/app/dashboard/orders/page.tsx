'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ClipboardList, DollarSign, Loader2, MapPin, PackageCheck, ShieldCheck, ShoppingCart, TrendingUp, Truck, XCircle } from 'lucide-react';
import { getProfile } from '../settings/actions';
import {
  cancelOrder,
  getMyJastiperOrders,
  getOrderTotalAmount,
  markJastiperOrderCompleted,
  markJastiperOrderShipped,
  type Order,
  type OrderStatus,
  updateOrderStatus,
} from './orderApi';
import { formatCompactDollar } from '@/lib/currency';
import { ConfirmModal } from '@/components/ConfirmModal';
import { formatShortId } from '@/lib/ids';
import { ORDER_NEXT_ACTION_LABEL, ORDER_STATUS_DESCRIPTION, ORDER_STATUS_LABEL } from '@/lib/orderStatus';
import { useRefunds } from '@/hooks/refund/useRefunds';
import { getRefundStatusLabel } from '@/lib/refundStatus';
import type { RefundResponse } from '@/types/wallet';

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-400 text-black',
  PAID: 'bg-cyan-400 text-black',
  PURCHASED: 'bg-blue-400 text-white',
  SHIPPED: 'bg-purple-400 text-white',
  COMPLETED: 'bg-green-400 text-black',
  DONE: 'bg-emerald-500 text-white',
  CANCELLED: 'bg-red-500 text-white',
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PAID: 'PURCHASED',
  PURCHASED: 'SHIPPED',
  SHIPPED: 'COMPLETED',
};

const TODO_STATUSES: OrderStatus[] = ['PAID', 'PURCHASED', 'SHIPPED', 'COMPLETED'];

function formatCurrency(value?: number | string | null) {
  if (value == null) return 'N/A';
  const numericValue = typeof value === 'string' ? Number(value) : value;
  return formatCompactDollar(Number.isFinite(numericValue) ? numericValue : 0);
}

function formatDateTime(value?: string | null) {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [canManageOrders, setCanManageOrders] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    | { type: 'status'; orderId: string; status: OrderStatus }
    | { type: 'cancel'; orderId: string }
    | { type: 'approve-refund'; refundId: string }
    | null
  >(null);
  const {
    refunds,
    actionLoading: refundActionLoading,
    error: refundError,
    success: refundSuccess,
    approveRefund,
  } = useRefunds();

  async function loadOrders() {
    setIsLoading(true);
    setError(null);

    try {
      const profileResult = await getProfile();
      if (profileResult.success !== true) {
        throw new Error(profileResult.error || 'Failed to load profile');
      }

      const isJastiper = profileResult.data.role.toUpperCase().includes('JASTIPER');
      setCanManageOrders(isJastiper);

      if (!isJastiper) {
        setOrders([]);
        return;
      }

      setOrders(await getMyJastiperOrders());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const counts = useMemo(() => {
    return {
      todo: orders.filter((order) => TODO_STATUSES.includes(order.orderStatus)).length,
      shipped: orders.filter((order) => order.orderStatus === 'SHIPPED').length,
      completed: orders.filter((order) => order.orderStatus === 'COMPLETED').length,
      done: orders.filter((order) => order.orderStatus === 'DONE').length,
      totalIncome: orders
        .filter((order) => order.orderStatus === 'DONE')
        .reduce((sum, order) => sum + getOrderTotalAmount(order), 0),
      activeValue: orders
        .filter((order) => TODO_STATUSES.includes(order.orderStatus))
        .reduce((sum, order) => sum + getOrderTotalAmount(order), 0),
    };
  }, [orders]);

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setActionOrderId(orderId);
    setError(null);
    setMessage(null);

    try {
      const updated = status === 'SHIPPED'
        ? await markJastiperOrderShipped(orderId)
        : status === 'COMPLETED'
          ? await markJastiperOrderCompleted(orderId)
          : await updateOrderStatus(orderId, status);
      setOrders((current) => current.map((order) => (order.orderId === orderId ? updated : order)));
      setMessage(`Order moved to ${ORDER_STATUS_LABEL[status]}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setActionOrderId(null);
    }
  }

  async function handleCancel(orderId: string) {
    setActionOrderId(orderId);
    setError(null);
    setMessage(null);

    try {
      const updated = await cancelOrder(orderId, 'Physical store stock is unavailable');
      setOrders((current) => current.map((order) => (order.orderId === orderId ? updated : order)));
      setMessage('Order cancelled and refund process requested');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setActionOrderId(null);
    }
  }

  async function handleApproveRefund(refundId: string) {
    setError(null);
    setMessage(null);
    const ok = await approveRefund(refundId);
    if (ok) setMessage('Refund approved and buyer wallet credited');
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={64} aria-label="Loading orders" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 text-black">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 inline-block border-4 border-black bg-yellow-300 px-3 py-1 text-sm font-black uppercase shadow-[4px_4px_0px_0px_#000]">
            War Engine
          </p>
          <h1 className="text-5xl font-black uppercase text-purple-600 md:text-6xl">Jastiper Dashboard</h1>
          <p className="mt-4 max-w-2xl border-l-8 border-purple-400 bg-purple-50 px-4 py-3 text-lg font-bold">
            Process paid orders in sequence: Paid, Purchased, On Delivery, then Delivered.
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="border-4 border-black bg-white px-6 py-3 font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:bg-purple-100"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-8 flex items-center gap-4 border-4 border-black bg-red-100 p-5 font-bold shadow-[6px_6px_0px_0px_#000]">
          <AlertCircle className="text-red-600" size={28} />
          {error}
        </div>
      )}

      {message && (
        <div className="mb-8 flex items-center gap-4 border-4 border-black bg-green-300 p-5 font-black uppercase shadow-[6px_6px_0px_0px_#000]">
          <ShieldCheck size={28} />
          {message}
        </div>
      )}

      {(refundError || refundSuccess) && (
        <div className={`mb-8 flex items-center gap-4 border-4 border-black p-5 font-black uppercase shadow-[6px_6px_0px_0px_#000] ${refundError ? 'bg-red-100' : 'bg-green-300'}`}>
          <ShieldCheck size={28} />
          {refundError || refundSuccess}
        </div>
      )}

      {!canManageOrders ? (
        <div className="border-4 border-black bg-white p-12 text-center shadow-[12px_12px_0px_0px_#000]">
          <p className="text-3xl font-black uppercase">Jastiper access required</p>
          <p className="mt-2 font-bold text-gray-600">Only verified Jastipers can process incoming orders.</p>
        </div>
      ) : (
        <>
          <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-6">
            <MetricCard icon={<DollarSign size={40} />} title="Total Income" value={formatCompactDollar(counts.totalIncome)} color="bg-green-100" />
            <MetricCard icon={<TrendingUp size={40} />} title="Active Value" value={formatCompactDollar(counts.activeValue)} color="bg-cyan-100" />
            <MetricCard icon={<ClipboardList size={40} />} title="To-Do Orders" value={counts.todo.toString()} color="bg-yellow-100" />
            <MetricCard icon={<Truck size={40} />} title="On Delivery" value={counts.shipped.toString()} color="bg-purple-100" />
            <MetricCard icon={<PackageCheck size={40} />} title="Delivered" value={counts.completed.toString()} color="bg-green-100" />
            <MetricCard icon={<ShieldCheck size={40} />} title="Done" value={counts.done.toString()} color="bg-emerald-100" />
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase underline decoration-purple-400 decoration-8 underline-offset-8">
              Processing Queue
            </h2>

            {orders.length === 0 ? (
              <p className="border-4 border-black bg-white p-6 text-xl font-bold shadow-[8px_8px_0px_0px_#000]">
                No incoming orders yet.
              </p>
            ) : (
              orders.map((order) => (
                <OrderCard
                  key={order.orderId}
                  order={order}
                  actionOrderId={actionOrderId}
                  refund={refunds.find((refund) => refund.orderId === order.orderId)}
                  onRequestStatusChange={(orderId, status) => setPendingAction({ type: 'status', orderId, status })}
                  onCancel={(orderId) => setPendingAction({ type: 'cancel', orderId })}
                  onApproveRefund={(refundId) => setPendingAction({ type: 'approve-refund', refundId })}
                />
              ))
            )}
          </div>
        </>
      )}
      <ConfirmModal
        open={Boolean(pendingAction)}
        title={pendingAction?.type === 'cancel' ? 'Cancel Order?' : pendingAction?.type === 'approve-refund' ? 'Approve Refund?' : 'Update Order Status?'}
        message={
          pendingAction?.type === 'cancel'
            ? 'This will cancel the order and trigger the refund process.'
            : pendingAction?.type === 'approve-refund'
              ? 'This will debit your wallet and return funds to the buyer.'
            : `Move this order to ${pendingAction ? ORDER_STATUS_LABEL[pendingAction.status] : 'the next status'}?`
        }
        confirmText={pendingAction?.type === 'cancel' ? 'Cancel Order' : pendingAction?.type === 'approve-refund' ? 'Approve Refund' : 'Update'}
        confirmClassName={pendingAction?.type === 'cancel' ? 'bg-red-400 text-white hover:bg-red-500' : pendingAction?.type === 'approve-refund' ? 'bg-emerald-400 text-black hover:bg-emerald-500' : 'bg-purple-400 text-white hover:bg-purple-500'}
        isLoading={Boolean(actionOrderId) || refundActionLoading}
        onCancel={() => setPendingAction(null)}
        onConfirm={async () => {
          if (!pendingAction) return;
          if (pendingAction.type === 'cancel') {
            await handleCancel(pendingAction.orderId);
          } else if (pendingAction.type === 'approve-refund') {
            await handleApproveRefund(pendingAction.refundId);
          } else {
            await handleStatusChange(pendingAction.orderId, pendingAction.status);
          }
          setPendingAction(null);
        }}
      />
    </div>
  );
}

function MetricCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string; color: string }) {
  return (
    <div className={`border-4 border-black ${color} p-6 shadow-[12px_12px_0px_0px_#000]`}>
      <div className="mb-4 text-purple-600">{icon}</div>
      <h2 className="text-lg font-black uppercase">{title}</h2>
      <p className="truncate text-4xl font-black" title={value}>{value}</p>
    </div>
  );
}

function OrderCard({
  order,
  actionOrderId,
  refund,
  onRequestStatusChange,
  onCancel,
  onApproveRefund,
}: {
  order: Order;
  actionOrderId: string | null;
  refund?: RefundResponse;
  onRequestStatusChange: (orderId: string, status: OrderStatus) => void;
  onCancel: (orderId: string) => void;
  onApproveRefund: (refundId: string) => void;
}) {
  const nextStatus = NEXT_STATUS[order.orderStatus];
  const canCancel = !['CANCELLED', 'COMPLETED', 'DONE'].includes(order.orderStatus);
  const isActionLoading = actionOrderId === order.orderId;
  const pendingRefund = refund?.status === 'PENDING' ? refund : null;

  return (
    <article className="flex flex-col gap-5 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000] md:flex-row md:items-start md:justify-between">
      <div className="flex items-start gap-4">
        <div className="border-2 border-black bg-purple-100 p-4 shadow-[4px_4px_0px_0px_#000]">
          <ShoppingCart size={32} className="text-purple-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase" title={order.orderId}>Order #{formatShortId(order.orderId)}</h3>
          <p className="max-w-[520px] truncate font-bold text-gray-700" title={order.productId}>Product: {formatShortId(order.productId)}</p>
          <p className="max-w-[520px] truncate font-bold text-gray-700" title={order.titipersId}>Titiper: {formatShortId(order.titipersId)}</p>
          <p className="font-bold text-gray-700">Quantity: {order.quantity}</p>
          <p className="max-w-[520px] truncate font-bold text-gray-700" title={formatCurrency(order.totalAmount)}>Total: {formatCurrency(order.totalAmount)}</p>
          <div className="flex items-start gap-2 font-bold text-gray-700">
            <MapPin size={16} className="mt-1" />
            <span>{order.shippingAddress}</span>
          </div>
          <p className="text-sm font-bold text-gray-500">Created: {formatDateTime(order.createdAt)}</p>
          {order.cancellationReason && (
            <p className="border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              Cancel reason: {order.cancellationReason}
            </p>
          )}
        </div>
      </div>

      <div className="flex min-w-[220px] flex-col gap-4 md:items-end">
        <span className={`inline-flex border-2 border-black px-4 py-1 text-sm font-black uppercase shadow-[4px_4px_0px_0px_#000] ${STATUS_STYLE[order.orderStatus]}`}>
          {ORDER_STATUS_LABEL[order.orderStatus]}
        </span>
        <p className="max-w-[220px] text-sm font-bold text-gray-600 md:text-right">
          {ORDER_STATUS_DESCRIPTION[order.orderStatus]}
        </p>

        {refund && (
          <div className="w-full border-4 border-black bg-purple-100 p-4 shadow-[4px_4px_0px_0px_#000] md:w-[260px]">
            <p className="text-xs font-black uppercase text-gray-500">Refund</p>
            <p className="font-black uppercase">{getRefundStatusLabel(refund.status)}</p>
            {refund.reason && <p className="mt-2 text-sm font-bold text-gray-700">&quot;{refund.reason}&quot;</p>}
            {pendingRefund && order.orderStatus === 'COMPLETED' && (
              <button
                onClick={() => onApproveRefund(pendingRefund.id)}
                className="mt-4 w-full border-4 border-black bg-emerald-300 px-4 py-3 font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:bg-emerald-400"
              >
                Approve Refund
              </button>
            )}
          </div>
        )}

        {nextStatus && (
          <button
            disabled={isActionLoading}
            onClick={() => onRequestStatusChange(order.orderId, nextStatus)}
            className="w-full border-4 border-black bg-black px-5 py-3 font-black uppercase text-white shadow-[4px_4px_0px_0px_#000] hover:bg-purple-600 disabled:opacity-60 md:w-auto"
          >
            {isActionLoading ? 'Updating...' : ORDER_NEXT_ACTION_LABEL[nextStatus]}
          </button>
        )}

        {canCancel && (
          <button
            disabled={isActionLoading}
            onClick={() => onCancel(order.orderId)}
            className="flex w-full items-center justify-center gap-2 border-4 border-black bg-red-300 px-5 py-3 font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:bg-red-400 disabled:opacity-60 md:w-auto"
          >
            <XCircle size={18} />
            Cancel
          </button>
        )}
      </div>
    </article>
  );
}
