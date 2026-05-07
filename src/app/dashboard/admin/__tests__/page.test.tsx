import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import AdminPortal from '../page';
import { apiFetch } from '../../../../lib/api';
import * as navigation from 'next/navigation';
import { ReactNode } from 'react';

jest.mock('../../../../lib/api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(() => '/'),
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
    ShieldCheck: IconMock, Users: IconMock, ClipboardList: IconMock,
    Activity: IconMock, Mail: IconMock, User: IconMock,
    Calendar: IconMock, ExternalLink: IconMock, CheckCircle: IconMock,
    XCircle: IconMock, LayoutDashboard: IconMock, Loader2: IconMock,
  };
});

describe('AdminPortal 100% Final Strictly', () => {
  const mockPush = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (navigation.useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (navigation.useSearchParams as jest.Mock).mockReturnValue({ get: mockGet });
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

  it('exhausts all user and request extraction branches', async () => {
    // Path 1: Array success for both
    (apiFetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/user/')) return Promise.resolve(mockRes([{ id: 'u1-unq', username: 'un1-unq' }]));
      if (url.includes('/get-all')) return Promise.resolve(mockRes([{ id: 'r1-unq', requesterUsername: 'un1-unq' }]));
      return Promise.resolve(mockRes([]));
    });
    render(<AdminPortal />);
    await act(async () => {});
    await act(async () => { fireEvent.click(screen.getByText(/User Registry/i)); });
    expect(await screen.findByText('un1-unq')).toBeInTheDocument();
    cleanup();

    // Path 2: getUsers fail -> fallback (Line 62 else)
    (apiFetch as jest.Mock).mockResolvedValueOnce(mockRes({}, false)); // primary fail
    (apiFetch as jest.Mock).mockResolvedValueOnce(mockRes({}, false)); // secondary fail
    (apiFetch as jest.Mock).mockResolvedValue(mockRes([]));
    render(<AdminPortal />);
    await act(async () => {});
    await act(async () => { fireEvent.click(screen.getByText(/User Registry/i)); });
    expect(await screen.findByText('admin1')).toBeInTheDocument();
    cleanup();

    // Path 3: requests primary empty -> alt success -> upgradeRequests key
    (apiFetch as jest.Mock).mockResolvedValueOnce(mockRes([])); // users
    (apiFetch as jest.Mock).mockResolvedValueOnce(mockRes([], true)); // primary empty
    (apiFetch as jest.Mock).mockResolvedValueOnce(mockRes({ upgradeRequests: [{ id: 'alt-unq', requesterUsername: 'un-alt' }] }));
    render(<AdminPortal />);
    expect(await screen.findByText(new RegExp('Upgrade Requests \\(1\\)', 'i'))).toBeInTheDocument();
    cleanup();

    // Path 4: requests fallback all fail (Line 121)
    (apiFetch as jest.Mock).mockResolvedValue(mockRes({}, false));
    render(<AdminPortal />);
    expect(await screen.findByText(new RegExp('Upgrade Requests \\(2\\)', 'i'))).toBeInTheDocument();
  });

  it('exhausts handleRequestAction branches strictly', async () => {
    (apiFetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/get-all')) return Promise.resolve(mockRes([{ id: 'r1-unq', requesterUsername: 'u1-unq' }]));
      return Promise.resolve(mockRes({ success: true }));
    });
    render(<AdminPortal />);
    await act(async () => { fireEvent.click(screen.getByText(/Upgrade Requests/i)); });
    
    // APPROVE success (Line 178)
    await act(async () => { fireEvent.click(screen.getAllByText('APPROVE')[0]); });
    expect(await screen.findByText(/Successfully approved/i)).toBeInTheDocument();
    await act(async () => { jest.runOnlyPendingTimers(); }); 
    cleanup();

    // failure with message fallback
    (apiFetch as jest.Mock).mockImplementation((url, opts) => {
      if (url.includes('/get-all')) return Promise.resolve(mockRes([{ id: 'r1-unq', requesterUsername: 'u1-unq' }]));
      if (opts?.method === 'PATCH') return Promise.resolve({ ok: false, status: 400, json: async () => ({ message: 'MsgFail' }) });
      return Promise.resolve(mockRes([]));
    });
    render(<AdminPortal />);
    await act(async () => { fireEvent.click(screen.getByText(/Upgrade Requests/i)); });
    await act(async () => { fireEvent.click(screen.getAllByText('REJECT')[0]); });
    expect(await screen.findByText('MsgFail')).toBeInTheDocument();
  });
});
