import { render, screen, fireEvent } from '@testing-library/react';
import JastiperRequestsPage from '../page';
import { apiFetch } from '../../../../../lib/api';

jest.mock('../../../../../lib/api', () => ({
  apiFetch: jest.fn(),
}));

describe('JastiperRequestsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockRes = (data: unknown, ok = true, status = 200) => ({
    ok,
    status,
    json: async () => data,
  });

  it('shows only pending requests', async () => {
    (apiFetch as jest.Mock).mockResolvedValueOnce(mockRes([
      { id: 'pending-1', requesterUsername: 'pending-user', status: 'PENDING' },
      { id: 'accepted-1', requesterUsername: 'accepted-user', status: 'ACCEPTED' },
    ]));

    render(<JastiperRequestsPage />);

    expect(await screen.findByText('pending-user')).toBeInTheDocument();
    expect(screen.queryByText('accepted-user')).not.toBeInTheDocument();
  });

  it('does not render dummy fallback data when fetch fails', async () => {
    (apiFetch as jest.Mock).mockResolvedValue(mockRes({}, false));

    render(<JastiperRequestsPage />);

    expect(await screen.findByText(/No pending upgrade requests found/i)).toBeInTheDocument();
  });

  it('updates request status', async () => {
    (apiFetch as jest.Mock).mockImplementation((url, opts) => {
      if (url.includes('/get-all')) {
        return Promise.resolve(mockRes([{ id: 'r1', requesterUsername: 'u1', status: 'PENDING' }]));
      }
      if (opts?.method === 'PATCH') return Promise.resolve(mockRes({ success: true }));
      return Promise.resolve(mockRes([]));
    });

    render(<JastiperRequestsPage />);

    fireEvent.click(await screen.findByText('APPROVE'));
    fireEvent.click(await screen.findByText('Approve'));
    expect(await screen.findByText(/Successfully approved/i)).toBeInTheDocument();
  });
});
