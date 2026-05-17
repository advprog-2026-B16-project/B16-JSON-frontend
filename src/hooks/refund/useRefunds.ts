import { useState, useCallback, useEffect } from 'react';
import { RefundResponse, RefundRequest } from '@/types/wallet';
import { RefundService } from '@/services/refund/refund.service';

export const useRefunds = () => {
  const [refunds, setRefunds] = useState<RefundResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
      const data = await RefundService.getMyRefunds();
      setRefunds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch refunds');
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  return {
    refunds,
    isLoading,
    actionLoading,
    error,
    success,
    fetchRefunds,
    requestRefund,
    clearAlerts,
  };
};
