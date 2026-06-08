import { useState, useCallback, useEffect } from 'react';
import { RefundResponse, RefundRequest } from '@/types/wallet';
import { RefundService } from '@/services/refund/refund.service';

type RefundScope = 'titiper' | 'jastiper';

export const useRefunds = (scope: RefundScope = 'titiper') => {
  const [refunds, setRefunds] = useState<RefundResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearAlerts = () => {
    setError('');
    setSuccess('');
  };

  const fetchRefunds = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = scope === 'jastiper'
        ? await RefundService.getMyJastiperRefunds()
        : await RefundService.getMyRefunds();
      setRefunds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch refunds');
    } finally {
      setIsLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const requestRefund = async (data: RefundRequest) => {
    setActionLoading(true);
    clearAlerts();
    try {
      await RefundService.requestRefund(data);
      setSuccess('Refund requested successfully!');
      await fetchRefunds();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request refund');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const approveRefund = async (refundId: string) => {
    setActionLoading(true);
    clearAlerts();
    try {
      await RefundService.approveJastiperRefund(refundId);
      setSuccess('Refund approved successfully!');
      await fetchRefunds();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve refund');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const rejectRefund = async (refundId: string) => {
    setActionLoading(true);
    clearAlerts();
    try {
      await RefundService.rejectJastiperRefund(refundId);
      setSuccess('Refund rejected successfully!');
      await fetchRefunds();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject refund');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    refunds,
    isLoading,
    actionLoading,
    error,
    success,
    fetchRefunds,
    requestRefund,
    approveRefund,
    rejectRefund,
    clearAlerts,
  };
};
