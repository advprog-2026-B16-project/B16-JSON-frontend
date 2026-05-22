import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPortal from '../page';
import { apiFetch } from '../../../../lib/api';
import * as navigation from 'next/navigation';

jest.mock('../../../../lib/api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(() => '/'),
}));

describe('AdminPortal', () => {
  const mockPush = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (navigation.useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (navigation.useSearchParams as jest.Mock).mockReturnValue({ get: mockGet });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockRes = (data: unknown, ok = true, status = 200) => ({
    ok,
    status,
    json: async () => data,
  });

  it('renders pending upgrade requests and filters accepted requests', async () => {
    (apiFetch as jest.Mock).mockImplementation((url) => {
      if (url === '/admin/users') return Promise.resolve(mockRes([]));
      if (url === '/admin/upgrade-requests') {
        return Promise.resolve(mockRes([
          { id: 'pending-1', requesterUsername: 'pending-user', status: 'PENDING' },
          { id: 'accepted-1', requesterUsername: 'accepted-user', status: 'ACCEPTED' },
        ]));
      }
      return Promise.resolve(mockRes([]));
    });

    render(<AdminPortal />);

    expect(await screen.findByText(/Upgrade Requests \(1\)/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Upgrade Requests/i));
    expect(await screen.findByText('pending-user')).toBeInTheDocument();
    expect(screen.queryByText('accepted-user')).not.toBeInTheDocument();
  });

  it('falls back to change-status endpoint when admin accept endpoint is missing', async () => {
    (apiFetch as jest.Mock).mockImplementation((url, opts) => {
      if (url === '/admin/users') return Promise.resolve(mockRes([]));
      if (url === '/admin/upgrade-requests') {
        return Promise.resolve(mockRes([{ id: 'request-1', requesterUsername: 'u1', status: 'PENDING' }]));
      }
      if (url === '/admin/topups') return Promise.resolve(mockRes([]));
      if (url === '/admin/upgrade-requests/request-1/accept' && opts?.method === 'PATCH') {
        return Promise.resolve(mockRes({ detail: 'missing' }, false, 404));
      }
      if (url === '/upgrade-request/change-status/request-1' && opts?.method === 'PATCH') {
        return Promise.resolve(mockRes({ success: true }));
      }
      return Promise.resolve(mockRes([]));
    });

    render(<AdminPortal />);
    fireEvent.click(await screen.findByText(/Upgrade Requests/i));
    fireEvent.click(await screen.findByText('APPROVE'));
    const approveButtons = await screen.findAllByText('APPROVE');
    fireEvent.click(approveButtons[approveButtons.length - 1]);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/upgrade-request/change-status/request-1', expect.objectContaining({ method: 'PATCH' }));
    });
    expect(await screen.findByText(/Successfully approved/i)).toBeInTheDocument();
  });
});
