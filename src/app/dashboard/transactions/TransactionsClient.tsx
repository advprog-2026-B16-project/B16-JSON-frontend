'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';
import { usePayments } from '@/hooks/payment/usePayments';
import { useRefunds } from '@/hooks/refund/useRefunds';
import { PaymentResponse } from '@/types/wallet';
import { formatCompactDollar, formatDollar } from '@/lib/currency';
import { formatShortId } from '@/lib/ids';
import { getOrderById, markTitiperOrderDone, type Order, type OrderStatus } from '@/app/dashboard/orders/orderApi';
import { ORDER_STATUS_DESCRIPTION, ORDER_STATUS_LABEL } from '@/lib/orderStatus';
import { getRefundStatusDescription, getRefundStatusLabel } from '@/lib/refundStatus';
import { ConfirmModal } from '@/components/ConfirmModal';

function getEffectiveStatus(payment: PaymentResponse, now: number) {
  if (payment.status === 'PENDING' && payment.expiresAt && now >= new Date(payment.expiresAt).getTime()) {
    return 'EXPIRED' as const;
  }

  return payment.status;
}

function displayPaymentStatus(status: PaymentResponse['status'] | 'EXPIRED') {
  return status === 'PENDING' ? 'UNPAID' : status;
}

function paymentStatusColor(status: PaymentResponse['status'] | 'EXPIRED') {
  if (status === 'SUCCESS') return 'bg-green-400 text-black';
  if (status === 'PENDING') return 'bg-yellow-400 text-black';
  if (status === 'FAILED') return 'bg-red-400 text-black';
  if (status === 'CANCELLED') return 'bg-slate-300 text-black';
  return 'bg-gray-400 text-black';
}

function orderStatusColor(status?: OrderStatus) {
  if (status === 'DONE') return 'bg-emerald-500 text-black';
  if (status === 'COMPLETED') return 'bg-green-400 text-black';
  if (status === 'SHIPPED') return 'bg-purple-400 text-black';
  if (status === 'PURCHASED') return 'bg-blue-400 text-black';
  if (status === 'PAID') return 'bg-cyan-300 text-black';
  if (status === 'CANCELLED') return 'bg-red-500 text-black';
  return 'bg-yellow-300 text-black';
}

export default function TransactionsClient() {
  const router = useRouter();
  const { payments, isLoading, error, fetchPayments } = usePayments();
  const { refunds, isLoading: refundsLoading, fetchRefunds } = useRefunds();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [ordersById, setOrdersById] = useState<Record<string, Order>>({});
  const [doneTarget, setDoneTarget] = useState<Order | null>(null);
  const [isConfirmingDone, setIsConfirmingDone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [orderRefreshNonce, setOrderRefreshNonce] = useState(0);
  const [actionError, setActionError] = useState('');

  const orderIds = useMemo(
    () => Array.from(new Set(payments.map((payment) => payment.orderId).filter(Boolean))),
    [payments],
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  async function handleRefresh() {
    setIsRefreshing(true);
    setIsOrdersLoading(true);
    setActionError('');
    setOrdersById({});
    setNow(Date.now());

    try {
      await Promise.all([fetchPayments(), fetchRefunds()]);
      setOrderRefreshNonce((current) => current + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to refresh transactions');
      setIsOrdersLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleConfirmDone() {
    if (!doneTarget) return;
    setIsConfirmingDone(true);
    setActionError('');
    try {
      const updated = await markTitiperOrderDone(doneTarget.orderId);
      setOrdersById((current) => ({ ...current, [updated.orderId]: updated }));
      setDoneTarget(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to confirm order as done');
    } finally {
      setIsConfirmingDone(false);
    }
  }

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const shouldRefreshAllOrders = orderRefreshNonce > 0;
    const targetOrderIds = shouldRefreshAllOrders
      ? orderIds
      : orderIds.filter((orderId) => !ordersById[orderId]);

    if (targetOrderIds.length === 0) {
      setIsOrdersLoading(false);
      return;
    }

    let isMounted = true;
    setIsOrdersLoading(true);
    Promise.allSettled(targetOrderIds.map((orderId) => getOrderById(orderId))).then((results) => {
      if (!isMounted) return;

      setOrdersById((current) => {
        const next = { ...current };
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            next[result.value.orderId] = result.value;
          }
        });
        return next;
      });
      setIsOrdersLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [orderIds, orderRefreshNonce]);

  const isTransactionLoading = isLoading || refundsLoading || isRefreshing || isOrdersLoading;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-black">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-5xl font-black uppercase mb-4 text-green-600">Transactions</h1>
          <p className="text-xl font-bold border-l-8 border-green-400 pl-4 bg-green-50 py-2">
            Monitor your purchases, payments, and deals.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isTransactionLoading}
          className="p-3 border-4 border-black hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 bg-white"
          title="Refresh transactions"
        >
          <RefreshCw size={24} className={isTransactionLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="bg-red-400 border-4 border-black p-4 mb-6 font-bold shadow-[4px_4px_0px_0px_#000]">
          {error}
        </div>
      )}

      {actionError && (
        <div className="bg-red-400 border-4 border-black p-4 mb-6 font-bold shadow-[4px_4px_0px_0px_#000]">
          {actionError}
        </div>
      )}

      <div className="space-y-6">
        <AnimatePresence>
          {isTransactionLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-3 p-12 border-4 border-black bg-white shadow-[12px_12px_0px_0px_#000] text-center"
            >
              <RefreshCw size={28} className="animate-spin text-green-600" />
              <p className="text-2xl font-black uppercase italic text-gray-700">Loading transactions...</p>
            </motion.div>
          ) : payments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="p-12 border-4 border-black bg-white shadow-[12px_12px_0px_0px_#000] text-center"
            >
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-50 text-gray-400" />
              <p className="text-2xl font-black uppercase italic text-gray-400">No purchases yet</p>
              <p className="mt-2 font-bold text-gray-600">You haven&apos;t made any transactions.</p>
            </motion.div>
          ) : (
            [...payments].sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime()).map((payment) => {
              const effectiveStatus = getEffectiveStatus(payment, now);
              const order = ordersById[payment.orderId];
              const refund = refunds.find((item) => item.originalTransactionId === payment.transactionId);
              const isRefunded = refund?.status === 'SUCCESS';
              const displayStatus = isRefunded
                ? getRefundStatusLabel(refund.status)
                : effectiveStatus === 'SUCCESS' && order
                ? ORDER_STATUS_LABEL[order.orderStatus]
                : displayPaymentStatus(effectiveStatus);
              const displayDescription = isRefunded
                ? getRefundStatusDescription(refund.status)
                : effectiveStatus === 'SUCCESS' && order
                ? ORDER_STATUS_DESCRIPTION[order.orderStatus]
                : effectiveStatus === 'PENDING'
                  ? 'Waiting for payment before the order enters Jastiper processing.'
                  : effectiveStatus === 'EXPIRED'
                    ? 'Payment window expired. Create a new payment from the order detail page.'
                    : `Payment is ${displayPaymentStatus(effectiveStatus).toLowerCase()}.`;
              const badgeColor = isRefunded
                ? 'bg-green-500 text-black'
                : effectiveStatus === 'SUCCESS' && order
                ? orderStatusColor(order.orderStatus)
                : paymentStatusColor(effectiveStatus);

              return (
              <motion.div 
                key={payment.id} 
                className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden"
              >
                {/* Header / Summary */}
                <div 
                  className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(payment.id)}
                >
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="bg-green-100 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                      <ShoppingBag size={32} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase" title={payment.orderId}>Order: {formatShortId(payment.orderId)}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-gray-600">Ref: {payment.referenceCode}</span>
                      </div>
                      <p className="mt-1 max-w-[420px] text-sm font-bold text-gray-500">
                        {displayDescription}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center w-full md:w-auto gap-6 justify-between md:justify-end">
                    <div className="text-right">
                      <p className="max-w-[220px] truncate text-2xl font-black text-green-600" title={formatDollar(payment.amount)}>
                        {formatCompactDollar(payment.amount)}
                      </p>
                      <span className={`px-3 py-1 border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000] mt-2 inline-block ${badgeColor}`}>
                        {displayStatus}
                      </span>
                    </div>
                    <button className="p-2 border-2 border-black rounded-full hover:bg-gray-200">
                      {expandedId === payment.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === payment.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t-4 border-black bg-gray-50 overflow-hidden"
                    >
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-xl font-black uppercase mb-4 border-b-2 border-black pb-2">Transaction Details</h4>
                          <ul className="space-y-3 font-medium">
                            <li className="flex flex-col">
                              <span className="text-xs font-black uppercase text-gray-500">Payment ID</span>
                              <span className="truncate font-mono" title={payment.id}>{formatShortId(payment.id)}</span>
                            </li>
                            <li className="flex flex-col">
                              <span className="text-xs font-black uppercase text-gray-500">Order ID</span>
                              <span className="truncate font-mono" title={payment.orderId}>{formatShortId(payment.orderId)}</span>
                            </li>
                            <li className="flex flex-col">
                              <span className="text-xs font-black uppercase text-gray-500">Transaction ID</span>
                              <span className="truncate font-mono" title={payment.transactionId || 'N/A'}>{formatShortId(payment.transactionId)}</span>
                            </li>
                            <li className="flex flex-col">
                              <span className="text-xs font-black uppercase text-gray-500">Payment Status</span>
                              <span>{displayPaymentStatus(effectiveStatus)}</span>
                            </li>
                            {order && (
                              <li className="flex flex-col">
                                <span className="text-xs font-black uppercase text-gray-500">Order Status</span>
                                <span>{ORDER_STATUS_LABEL[order.orderStatus]}</span>
                              </li>
                            )}
                            {payment.status === 'PENDING' && (
                              <li className="flex flex-col">
                                <span className="text-xs font-black uppercase text-gray-500">Expires At</span>
                                <span>{new Date(payment.expiresAt).toLocaleString()}</span>
                              </li>
                            )}
                            {payment.paidAt && (
                              <li className="flex flex-col">
                                <span className="text-xs font-black uppercase text-gray-500">Paid At</span>
                                <span>{new Date(payment.paidAt).toLocaleString()}</span>
                              </li>
                            )}
                          </ul>
                        </div>
                        <div className="flex flex-col justify-between">
                          <div>
                            <h4 className="text-xl font-black uppercase mb-4 border-b-2 border-black pb-2">Actions</h4>
                            {refund ? (
                              <div className="bg-green-100 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                                <p className="mb-2 text-sm font-black uppercase">{getRefundStatusLabel(refund.status)}</p>
                                <p className="font-bold text-sm">{getRefundStatusDescription(refund.status)}</p>
                              </div>
                            ) : effectiveStatus === 'SUCCESS' && payment.transactionId && order?.orderStatus === 'COMPLETED' ? (
                              <div className="bg-purple-100 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                                <p className="font-bold mb-4 text-sm">This order is delivered. Confirm done to release escrow funds, or request a refund if there is an issue.</p>
                                <button
                                  onClick={() => setDoneTarget(order)}
                                  className="mb-3 w-full bg-emerald-300 text-black px-4 py-3 font-black uppercase hover:bg-emerald-400 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2"
                                >
                                  Confirm Done
                                </button>
                                <button 
                                  onClick={() => router.push(`/dashboard/refund?transactionId=${payment.transactionId}`)}
                                  className="w-full bg-black text-white px-4 py-3 font-black uppercase hover:bg-purple-600 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2"
                                >
                                  <AlertCircle size={20} /> Request Refund
                                </button>
                              </div>
                            ) : effectiveStatus === 'SUCCESS' ? (
                              <div className="bg-green-100 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                                <p className="font-bold text-sm">
                                  Payment is complete. Current order progress: {order ? ORDER_STATUS_LABEL[order.orderStatus] : 'checking order status'}.
                                </p>
                              </div>
                            ) : effectiveStatus === 'PENDING' ? (
                              <div className="bg-yellow-100 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                                <p className="font-bold mb-4 text-sm">Please complete your payment before the expiration time.</p>
                                <button 
                                  onClick={() => router.push(`/dashboard/payment/${payment.referenceCode}`)}
                                  className="w-full bg-black text-white px-4 py-3 font-black uppercase hover:bg-yellow-600 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2"
                                >
                                  Process Payment
                                </button>
                              </div>
                            ) : effectiveStatus === 'EXPIRED' ? (
                              <div className="bg-gray-100 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                                <p className="font-bold text-sm">This payment window has expired. Go back to the order detail and proceed to payment again.</p>
                              </div>
                            ) : (
                              <p className="font-bold italic text-gray-500">No actions available for this transaction status.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
      <ConfirmModal
        open={Boolean(doneTarget)}
        title="Confirm Order Done?"
        message="This releases escrow funds to the Jastiper. Refund will no longer be available after this."
        confirmText="Confirm Done"
        confirmClassName="bg-emerald-400 text-black hover:bg-emerald-500"
        isLoading={isConfirmingDone}
        onCancel={() => setDoneTarget(null)}
        onConfirm={handleConfirmDone}
      />
    </div>
  );
}
