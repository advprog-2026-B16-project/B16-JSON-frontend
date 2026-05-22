'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Landmark, Loader2, ShieldCheck, WalletCards, XCircle } from 'lucide-react';
import { PaymentService } from '@/services/payment/payment.service';
import { PaymentResponse } from '@/types/wallet';
import { getOrderById, updateOrderStatus, type Order } from '../../orders/orderApi';
import { formatCompactDollar, formatDollar } from '@/lib/currency';

type PaymentMethod = 'wallet' | 'external';

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams<{ referenceCode: string }>();
  const referenceCode = params.referenceCode;
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('wallet');
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const payment = useMemo(
    () => payments.find((item) => item.referenceCode === referenceCode),
    [payments, referenceCode],
  );
  const expiresAt = payment?.expiresAt ? new Date(payment.expiresAt).getTime() : 0;
  const isClientExpired = Boolean(payment?.status === 'PENDING' && expiresAt && now >= expiresAt);
  const canPay = Boolean(payment?.status === 'PENDING' && !isClientExpired);
  const remainingMs = Math.max(0, expiresAt - now);

  const loadPayment = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await PaymentService.getMyPayments();
      setPayments(data);
      const selected = data.find((item) => item.referenceCode === referenceCode);
      if (!selected) throw new Error('Payment reference not found');
      setOrder(await getOrderById(selected.orderId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment');
    } finally {
      setIsLoading(false);
    }
  }, [referenceCode]);

  useEffect(() => {
    void loadPayment();
  }, [loadPayment]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isClientExpired) {
      router.replace('/dashboard/transactions');
    }
  }, [isClientExpired, router]);

  async function handleWalletPayment() {
    if (!payment || !order || !canPay) return;
    setIsPaying(true);
    setError('');
    setMessage('');

    try {
      await PaymentService.pay(payment.referenceCode);
      await updateOrderStatus(order.orderId, 'PAID').catch(() => null);
      setMessage('Payment completed and order marked as paid.');
      await loadPayment();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  }

  async function handleCancel() {
    if (!payment) return;
    setIsPaying(true);
    setError('');
    try {
      await PaymentService.cancelPayment(payment.referenceCode);
      setMessage('Payment cancelled.');
      await loadPayment();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel payment');
    } finally {
      setIsPaying(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-cyan-600" size={64} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 text-black">
      <button
        onClick={() => router.push('/dashboard/transactions')}
        className="mb-8 flex items-center gap-2 border-4 border-black bg-white px-4 py-2 font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:bg-gray-100"
      >
        <ArrowLeft size={20} /> Transactions
      </button>

      <div className="mb-10 border-4 border-black bg-cyan-100 p-8 shadow-[12px_12px_0px_0px_#000]">
        <p className="mb-3 inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]">
          <ShieldCheck size={16} /> Secure Checkout
        </p>
        <h1 className="text-4xl font-black uppercase md:text-6xl">Payment Detail</h1>
        <p className="mt-3 max-w-2xl font-bold text-gray-700">
          Choose wallet payment now, or keep the external gateway as a future integration placeholder.
        </p>
      </div>

      {(error || message) && (
        <div className={`mb-8 border-4 border-black p-5 font-black shadow-[6px_6px_0px_0px_#000] ${error ? 'bg-red-100' : 'bg-green-300'}`}>
          {error || message}
        </div>
      )}

      {!payment ? (
        <div className="border-4 border-black bg-red-100 p-8 font-black shadow-[8px_8px_0px_0px_#000]">
          Payment not found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <section className="border-4 border-black bg-white p-8 shadow-[10px_10px_0px_0px_#000]">
            <div className="mb-6 flex items-start justify-between gap-4 border-b-4 border-black pb-5">
              <div>
                <p className="text-xs font-black uppercase text-gray-500">Reference</p>
                <h2 className="truncate text-3xl font-black uppercase" title={payment.referenceCode}>{payment.referenceCode}</h2>
              </div>
              <StatusBadge status={payment.status} />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Detail label="Amount" value={formatDollar(payment.amount)} highlight />
              <Detail label="Order ID" value={payment.orderId} />
              <Detail label="Payment ID" value={payment.id} />
              <Detail label="Transaction ID" value={payment.transactionId || 'N/A'} />
              <Detail label="Expires" value={payment.expiresAt ? new Date(payment.expiresAt).toLocaleString() : 'N/A'} />
              <Detail label="Time Left" value={formatDuration(remainingMs)} />
              <Detail label="Paid At" value={payment.paidAt ? new Date(payment.paidAt).toLocaleString() : 'N/A'} />
            </div>
          </section>

          <aside className="border-4 border-black bg-yellow-100 p-6 shadow-[10px_10px_0px_0px_#000]">
            <h2 className="mb-5 text-2xl font-black uppercase">Payment Method</h2>
            <div className="mb-6 grid grid-cols-1 gap-3">
              <MethodButton
                active={method === 'wallet'}
                icon={<WalletCards size={22} />}
                title="JSON Wallet"
                description="Pay using your current wallet balance."
                onClick={() => setMethod('wallet')}
              />
              <MethodButton
                active={method === 'external'}
                icon={<Landmark size={22} />}
                title="External Gateway"
                description="Placeholder for VA, card, or e-wallet gateway."
                onClick={() => setMethod('external')}
              />
            </div>

            <div className="mb-6 border-2 border-black bg-white p-4">
              <p className="text-xs font-black uppercase text-gray-500">Payable</p>
              <p className="truncate text-4xl font-black text-green-600" title={formatDollar(payment.amount)}>
                {formatCompactDollar(payment.amount)}
              </p>
            </div>

            {payment.status === 'PENDING' ? (
              <div className="space-y-3">
                <div className={`border-2 border-black p-3 font-black uppercase ${isClientExpired ? 'bg-red-100 text-red-700' : 'bg-white'}`}>
                  Time left: {formatDuration(remainingMs)}
                </div>
                <button
                  disabled={isPaying || method === 'external' || !canPay}
                  onClick={handleWalletPayment}
                  className="flex w-full items-center justify-center gap-2 border-4 border-black bg-black px-5 py-4 font-black uppercase text-white shadow-[4px_4px_0px_0px_#000] hover:bg-cyan-300 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPaying ? <Loader2 className="animate-spin" /> : <CreditCard />}
                  {isClientExpired ? 'Payment Expired' : method === 'external' ? 'Gateway Placeholder' : 'Pay With Wallet'}
                </button>
                <button
                  disabled={isPaying}
                  onClick={handleCancel}
                  className="flex w-full items-center justify-center gap-2 border-4 border-black bg-white px-5 py-3 font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:bg-red-300 disabled:opacity-50"
                >
                  <XCircle size={18} /> Cancel Payment
                </button>
              </div>
            ) : (
              <div className="border-2 border-black bg-white p-4 font-bold">
                This payment is {payment.status === 'SUCCESS' ? 'already completed' : payment.status.toLowerCase()}.
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: PaymentResponse['status'] }) {
  const style = status === 'SUCCESS'
    ? 'bg-green-400'
    : status === 'PENDING'
      ? 'bg-yellow-300'
      : status === 'FAILED'
        ? 'bg-red-400 text-white'
        : 'bg-gray-300';

  return (
    <span className={`shrink-0 border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] ${style}`}>
      {status === 'PENDING' ? 'UNPAID' : status}
    </span>
  );
}

function MethodButton({ active, icon, title, description, onClick }: { active: boolean; icon: React.ReactNode; title: string; description: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex gap-3 border-4 border-black p-4 text-left shadow-[4px_4px_0px_0px_#000] ${active ? 'bg-cyan-300' : 'bg-white hover:bg-gray-50'}`}
    >
      <span className="mt-1">{icon}</span>
      <span>
        <span className="block font-black uppercase">{title}</span>
        <span className="block text-sm font-bold text-gray-600">{description}</span>
      </span>
    </button>
  );
}

function Detail({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="min-w-0 border-2 border-black bg-gray-50 p-4">
      <p className="mb-1 text-xs font-black uppercase text-gray-500">{label}</p>
      <p className={`truncate font-black ${highlight ? 'text-2xl text-green-600' : 'font-mono text-sm'}`} title={value}>
        {value}
      </p>
    </div>
  );
}

function formatDuration(ms: number) {
  if (ms <= 0) return 'Expired';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
