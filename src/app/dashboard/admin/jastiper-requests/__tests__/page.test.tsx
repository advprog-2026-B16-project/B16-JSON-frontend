import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import JastiperRequestsPage from '../page';
import { apiFetch } from '../../../../../lib/api';
import { ReactNode } from 'react';

jest.mock('../../../../../lib/api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: ReactNode; layout?: boolean; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('lucide-react', () => {
  const IconMock = (props: Record<string, unknown>) => <svg data-testid="icon" {...props} />;
  return {
    ClipboardList: IconMock, CheckCircle: IconMock, XCircle: IconMock, 
    User: IconMock, Calendar: IconMock, ExternalLink: IconMock, Loader2: IconMock,
  };
});

describe('JastiperRequestsPage 100% Final Precision', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  const mockRes = (data: unknown, ok = true, status = 200) => ({
    ok,
    status,
    json: async () => data,
  });

  it('exhausts all fetch and normalization branches strictly', async () => {
    // 1. requests key success
    (apiFetch as jest.Mock).mockResolvedValueOnce(mockRes({ requests: [{ id: 'r1-unq', requesterUsername: 'un1-unq' }] }));
    render(<JastiperRequestsPage />);
    expect(await screen.findByText('un1-unq')).toBeInTheDocument();
    cleanup();

    // 2. isEmpty object -> alt success
    (apiFetch as jest.Mock).mockResolvedValueOnce(mockRes({}, true));
    (apiFetch as jest.Mock).mockResolvedValueOnce(mockRes([{ id: 'r2-unq', requesterUsername: 'un2-unq' }]));
    render(<JastiperRequestsPage />);
    expect(await screen.findByText('un2-unq')).toBeInTheDocument();
    cleanup();

    // 3. all fail fallback (Line 68-70)
    (apiFetch as jest.Mock).mockResolvedValue(mockRes({}, false));
    render(<JastiperRequestsPage />);
    expect(await screen.findByText('aaa aaa aaa')).toBeInTheDocument();
    cleanup();

    // 4. catch fallback
    (apiFetch as jest.Mock).mockRejectedValue(new Error());
    render(<JastiperRequestsPage />);
    expect(await screen.findByText('bbb bbb bbb')).toBeInTheDocument();
  });

  it('exhausts handleAction all branches strictly', async () => {
    (apiFetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/get-all')) return Promise.resolve(mockRes([{ id: 'r1-unq', requesterUsername: 'u1-unq' }]));
      return Promise.resolve(mockRes({ success: true }));
    });
    render(<JastiperRequestsPage />);
    await screen.findByText('u1-unq');
    
    // APPROVE success (Line 89)
    await act(async () => { fireEvent.click(screen.getByText('APPROVE')); });
    expect(screen.getByText(/Successfully approved/i)).toBeInTheDocument();
    await act(async () => { jest.runOnlyPendingTimers(); });
    cleanup();

    // Failure with detail
    (apiFetch as jest.Mock).mockImplementation((url, opts) => {
      if (url.includes('/get-all')) return Promise.resolve(mockRes([{ id: 'r1-unq', requesterUsername: 'u1-unq' }]));
      if (opts?.method === 'PATCH') return Promise.resolve({ ok: false, status: 400, json: async () => ({ detail: 'Det-unq' }) });
      return Promise.resolve(mockRes([]));
    });
    render(<JastiperRequestsPage />);
    await screen.findByText('u1-unq');
    await act(async () => { fireEvent.click(screen.getByText('REJECT')); });
    expect(await screen.findByText('Det-unq')).toBeInTheDocument();
    cleanup();

    // catch branch non-Error (Line 113)
    (apiFetch as jest.Mock).mockImplementation((url, opts) => {
      if (url.includes('/get-all')) return Promise.resolve(mockRes([{ id: 'r1-unq', requesterUsername: 'u1-unq' }]));
      if (opts?.method === 'PATCH') return Promise.reject("Fail-unq");
      return Promise.resolve(mockRes([]));
    });
    render(<JastiperRequestsPage />);
    await screen.findByText('u1-unq');
    await act(async () => { fireEvent.click(screen.getByText('APPROVE')); });
    expect(await screen.findByText(/Action failed/i)).toBeInTheDocument();
  });
});
