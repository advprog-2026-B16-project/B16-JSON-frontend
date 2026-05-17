'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';
import { usePayments } from '@/hooks/payment/usePayments';

export default function TransactionsClient() {
  const router = useRouter();
  const { payments, isLoading, error, fetchPayments } = usePayments();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
          onClick={fetchPayments}
          disabled={isLoading}
          className="p-3 border-4 border-black hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 bg-white"
          title="Refresh transactions"
        >
          <RefreshCw size={24} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="bg-red-400 border-4 border-black p-4 mb-6 font-bold shadow-[4px_4px_0px_0px_#000]">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <AnimatePresence>
          {payments.length === 0 && !isLoading ? (
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
            [...payments].sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime()).map((payment) => (
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
                      <h3 className="text-2xl font-black uppercase">Order: {payment.orderId.slice(0,8)}...</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-gray-600">Ref: {payment.referenceCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center w-full md:w-auto gap-6 justify-between md:justify-end">
                    <div className="text-right">
                      <p className="text-2xl font-black text-green-600">
                        ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`px-3 py-1 border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000] mt-2 inline-block ${
                        payment.status === 'PAID' ? 'bg-green-400' :
                        payment.status === 'PENDING' ? 'bg-yellow-400' :
                        payment.status === 'FAILED' ? 'bg-red-400' : 'bg-gray-400'
                      }`}>
                        {payment.status}
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
                              <span className="font-mono">{payment.id}</span>
                            </li>
                            <li className="flex flex-col">
                              <span className="text-xs font-black uppercase text-gray-500">Order ID</span>
                              <span className="font-mono">{payment.orderId}</span>
                            </li>
                            <li className="flex flex-col">
                              <span className="text-xs font-black uppercase text-gray-500">Transaction ID</span>
                              <span className="font-mono">{payment.transactionId || 'N/A'}</span>
                            </li>
                            <li className="flex flex-col">
                              <span className="text-xs font-black uppercase text-gray-500">Expires At</span>
                              <span>{new Date(payment.expiresAt).toLocaleString()}</span>
                            </li>
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
                            {payment.status === 'PAID' && payment.transactionId ? (
                              <div className="bg-purple-100 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                                <p className="font-bold mb-4 text-sm">Have an issue with this order? You can request a refund if the seller has not fulfilled the jastip properly.</p>
                                <button 
                                  onClick={() => router.push(`/dashboard/refund?transactionId=${payment.transactionId}`)}
                                  className="w-full bg-black text-white px-4 py-3 font-black uppercase hover:bg-purple-600 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2"
                                >
                                  <AlertCircle size={20} /> Request Refund
                                </button>
                              </div>
                            ) : payment.status === 'PENDING' ? (
                              <div className="bg-yellow-100 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                                <p className="font-bold mb-4 text-sm">Please complete your payment before the expiration time.</p>
                                <button 
                                  onClick={() => router.push(`/dashboard/payment`)}
                                  className="w-full bg-black text-white px-4 py-3 font-black uppercase hover:bg-yellow-600 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2"
                                >
                                  Go to Payment Panel
                                </button>
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
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
