import { render, screen, fireEvent } from '@testing-library/react';
import WalletClient from '../WalletClient';
import { useWallet } from '../../../../hooks/wallet/useWallet';
import { useRouter } from 'next/navigation';

jest.mock('../../../../hooks/wallet/useWallet', () => ({
  useWallet: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('WalletClient', () => {
  const mockFetchWalletData = jest.fn();
  const mockHandleAction = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
    (useWallet as jest.Mock).mockReturnValue({
      userId: 'test-user',
      balance: 150.5,
      transactions: [],
      isLoading: false,
      actionLoading: false,
      error: null,
      fetchWalletData: mockFetchWalletData,
      handleAction: mockHandleAction,
    });
  });

  it('renders wallet dashboard correctly', () => {
    render(<WalletClient initialUserId="test-user" />);
    expect(screen.getByRole('heading', { name: /Wallet/i })).toBeInTheDocument();
    // Assuming WalletBalance component renders the balance properly
    expect(screen.getAllByText(/150\.50/).length).toBeGreaterThan(0);
  });

  it('handles back navigation', () => {
    render(<WalletClient initialUserId="test-user" />);
    const backBtn = screen.getByText(/Back/i);
    fireEvent.click(backBtn);
    expect(mockBack).toHaveBeenCalled();
  });

  it('shows topup confirmation modal and confirms', async () => {
    render(<WalletClient initialUserId="test-user" />);
    
    // Fill top up form
    const input = screen.getAllByRole('spinbutton')[0]; // First input is topup
    fireEvent.change(input, { target: { value: '50' } });
    
    // Click top up button
    const submitBtns = screen.getAllByRole('button', { name: /Confirm Top-Up/i });
    fireEvent.click(submitBtns[submitBtns.length - 1]); // Last one is the actual form submit button, or we can just find it
    
    // Wait for modal
    expect(await screen.findByText('CONFIRM TOP UP')).toBeInTheDocument();
    
    // Click confirm in modal
    const confirmBtn = screen.getByText('TOP UP', { selector: '.bg-emerald-400' });
    fireEvent.click(confirmBtn);
    
    expect(mockHandleAction).toHaveBeenCalledWith('topup', 50);
  });
});
