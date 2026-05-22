'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, BadgeCheck, RefreshCw, RotateCcw, ShieldCheck, WalletCards } from 'lucide-react';
import { useRefunds } from '@/hooks/refund/useRefunds';
import { usePayments } from '@/hooks/payment/usePayments';
import { RefundActionForm } from '@/features/refund/components';
import { formatCompactDollar, formatDollar } from '@/lib/currency';
import { getOrderById, type Order } from '@/app/dashboard/orders/orderApi';
import { formatShortId } from '@/lib/ids';
import { getRefundStatusDescription, getRefundStatusLabel } from '@/lib/refundStatus';

export default function RefundClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTransactionId = searchParams.get('transactionId') || '';
  const [now, setNow] = useState(() => Date.now());
  const [orderLookup, setOrderLookup] = useState<{ orderId: string; order: Order | null; error: string }>({
    orderId: '',
    order: null,
    error: '',
  });

  const {
    refunds,
    isLoading,
    actionLoading,
    error,
    success,
    fetchRefunds,
    requestRefund,
  } = useRefunds();
  const { payments, isLoading: paymentsLoading } = usePayments();

  const relatedPayment = useMemo(
    () => payments.find((payment) => payment.transactionId === initialTransactionId),
    [payments, initialTransactionId],
  );
  const existingRefund = useMemo(
    () => refunds.find((refund) => refund.originalTransactionId === initialTransactionId),
    [refunds, initialTransactionId],
  );
  const relatedOrder = orderLookup.orderId === relatedPayment?.orderId ? orderLookup.order : null;
  const orderError = orderLookup.orderId === relatedPayment?.orderId ? orderLookup.error : '';
  const completedAt = relatedOrder?.updatedAt ? new Date(relatedOrder.updatedAt) : null;
  const refundDeadline = completedAt ? new Date(completedAt.getTime() + 3 * 24 * 60 * 60 * 1000) : null;
  const isWithinRefundWindow = Boolean(refundDeadline && now <= refundDeadline.getTime());
  const canRequest = Boolean(
    initialTransactionId
      && relatedPayment?.status === 'SUCCESS'
      && relatedOrder?.orderStatus === 'COMPLETED'
      && isWithinRefundWindow
      && !existingRefund,
  );
  const disabledReason = useMemo(() => {
    if (!initialTransactionId) return '';
    if (paymentsLoading) return 'Checking payment eligibility...';
    if (existingRefund) return getRefundStatusDescription(existingRefund.status);
    if (!relatedPayment || relatedPayment.status !== 'SUCCESS') return 'Only successful payments can be refunded.';
    if (orderError) return orderError;
    if (!relatedOrder) return 'Checking order completion status...';
    if (relatedOrder.orderStatus !== 'COMPLETED') return 'Refund can only be requested after the order is completed.';
    if (!relatedOrder.updatedAt) return 'Completed timestamp is unavailable for this order.';
    if (!isWithinRefundWindow) return 'Refund window has ended. Requests must be submitted within 3 days after completion.';
    return '';
  }, [existingRefund, initialTransactionId, isWithinRefundWindow, orderError, paymentsLoading, relatedOrder, relatedPayment]);

  useEffect(() => {
    if (!relatedPayment?.orderId) return;

    let isMounted = true;
    getOrderById(relatedPayment.orderId)
      .then((order) => {
        if (isMounted) setOrderLookup({ orderId: relatedPayment.orderId, order, error: '' });
      })
      .catch((err) => {
        if (isMounted) {
          setOrderLookup({
            orderId: relatedPayment.orderId,
            order: null,
            error: err instanceof Error ? err.message : 'Failed to check refund window',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [relatedPayment?.orderId]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const handleRequestRefund = async (transactionId: string, reason: string) => {
    await requestRefund({ transactionId, reason });
  };

  return (
    <div className="min-h-screen bg-white px-6 py-12 text-black">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => router.push('/dashboard/transactions')}
          className="mb-8 flex items-center gap-2 border-4 border-black bg-white px-4 py-2 font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:bg-gray-100"
        >
          <ArrowLeft size={20} /> Transactions
        </button>

        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 border-4 border-black bg-purple-300 px-3 py-1 text-sm font-black uppercase shadow-[4px_4px_0px_0px_#000]">
              <ShieldCheck size={16} /> Buyer Protection
            </p>
            <h1 className="text-5xl font-black uppercase text-purple-600 md:text-6xl">Refund Request</h1>
            <p className="mt-4 max-w-2xl border-l-8 border-purple-400 bg-purple-50 px-4 py-3 text-lg font-bold">
              Review this transaction and submit one refund claim for this order.
            </p>
          </div>
          <button
            onClick={fetchRefunds}
            disabled={isLoading}
            className="flex items-center gap-2 border-4 border-black bg-white px-5 py-3 font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:bg-purple-100 disabled:opacity-50"
            title="Refresh refunds"
          >
            <RefreshCw size={22} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatusCard icon={<WalletCards size={28} />} title="Paid Transaction" active={Boolean(relatedPayment?.status === 'SUCCESS')} />
          <StatusCard icon={<RotateCcw size={28} />} title="Refund Claim" active={Boolean(existingRefund)} />
          <StatusCard icon={<BadgeCheck size={28} />} title="Resolution" active={existingRefund?.status === 'SUCCESS'} />
        </div>

        {initialTransactionId && (
          <div className="mb-10 border-4 border-black bg-yellow-100 p-6 shadow-[8px_8px_0px_0px_#000]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase text-gray-600">Selected transaction</p>
                <h2 className="truncate text-2xl font-black uppercase" title={initialTransactionId}>
                  {formatShortId(initialTransactionId)}
                </h2>
                <p className="mt-1 font-bold text-gray-700">
                  {paymentsLoading
                    ? 'Checking payment eligibility...'
                    : existingRefund
                      ? getRefundStatusDescription(existingRefund.status)
                      : canRequest
                        ? `Eligible completed order found for ${formatDollar(relatedPayment?.amount || 0)}.`
                        : disabledReason || 'This transaction is not eligible for refund from this account.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm font-bold sm:min-w-[320px]">
                <MiniFact label="Amount" value={relatedPayment ? formatCompactDollar(relatedPayment.amount) : 'N/A'} />
                <MiniFact label="Order" value={relatedOrder ? relatedOrder.orderStatus : 'N/A'} />
                <MiniFact label="Deadline" value={refundDeadline ? refundDeadline.toLocaleDateString() : 'N/A'} />
                <MiniFact label="Status" value={existingRefund ? getRefundStatusLabel(existingRefund.status) : (canRequest ? 'ELIGIBLE' : 'LOCKED')} />
              </div>
            </div>
          </div>
        )}

        {(error || success) && (
          <div className={`mb-8 border-4 border-black p-5 font-black uppercase shadow-[6px_6px_0px_0px_#000] ${error ? 'bg-red-300' : 'bg-emerald-300'}`}>
            {error || success}
          </div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-auto max-w-3xl"
        >
          {!initialTransactionId ? (
            <div className="border-4 border-black bg-white p-8 text-center shadow-[10px_10px_0px_0px_#000]">
              <h2 className="text-3xl font-black uppercase">No Transaction Selected</h2>
              <p className="mt-3 font-bold text-gray-600">
                Open refund from a specific transaction so the claim is tied to one order.
              </p>
              <button
                onClick={() => router.push('/dashboard/transactions')}
                className="mt-6 border-4 border-black bg-black px-5 py-4 font-black uppercase text-white shadow-[4px_4px_0px_0px_#000] hover:bg-purple-300 hover:text-black"
              >
                Go to Transactions
              </button>
            </div>
          ) : existingRefund ? (
            <div className="border-4 border-black bg-green-100 p-6 shadow-[10px_10px_0px_0px_#000]">
              <div className="mb-5 flex items-start gap-3 border-b-4 border-black pb-4">
                <div className="border-2 border-black bg-white p-2">
                  <RotateCcw size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase">{getRefundStatusLabel(existingRefund.status)}</h2>
                  <p className="text-sm font-bold text-gray-700">{getRefundStatusDescription(existingRefund.status)}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm font-bold sm:grid-cols-2">
                <MiniFact label="Refund Amount" value={formatCompactDollar(existingRefund.amount)} />
                <MiniFact label="Refund Tx" value={formatShortId(existingRefund.refundTransactionId)} />
                <MiniFact label="Original Tx" value={formatShortId(existingRefund.originalTransactionId)} />
                <MiniFact label="Order" value={formatShortId(existingRefund.orderId)} />
              </div>
              {existingRefund.reason && (
                <p className="mt-5 border-l-4 border-purple-400 bg-white px-3 py-2 text-sm font-bold text-gray-700">
                  &quot;{existingRefund.reason}&quot;
                </p>
              )}
              <button
                onClick={() => router.push('/dashboard/transactions')}
                className="mt-6 w-full border-4 border-black bg-black px-5 py-4 font-black uppercase text-white shadow-[4px_4px_0px_0px_#000] hover:bg-purple-300 hover:text-black"
              >
                Back to Transactions
              </button>
            </div>
          ) : (
            <RefundActionForm
              isLoading={actionLoading || isLoading || paymentsLoading || Boolean(initialTransactionId && !canRequest)}
              onSubmit={handleRequestRefund}
              initialTransactionId={initialTransactionId}
              lockedTransaction={Boolean(initialTransactionId)}
              disabledReason={disabledReason}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StatusCard({ icon, title, active }: { icon: React.ReactNode; title: string; active: boolean }) {
  return (
    <div className={`border-4 border-black p-5 shadow-[6px_6px_0px_0px_#000] ${active ? 'bg-green-300' : 'bg-white'}`}>
      <div className="mb-3 flex items-center gap-3">
        <div className="border-2 border-black bg-white p-2">{icon}</div>
        <span className="text-xs font-black uppercase">{active ? 'Done' : 'Pending'}</span>
      </div>
      <p className="text-xl font-black uppercase">{title}</p>
    </div>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-2 border-black bg-white p-3">
      <p className="text-xs font-black uppercase text-gray-500">{label}</p>
      <p className="truncate font-black" title={value}>{value}</p>
    </div>
  );
}
