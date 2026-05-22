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
    cleanup();
    jest.useRealTimers();
  });

  const mockRes = (data: unknown, ok = true, status = 200) => ({
    ok,
    status,
    json: async () => data,
  });

  it('renders data correctly', async () => {
    (apiFetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/admin/users')) return Promise.resolve(mockRes([{ id: 'u1', username: 'un1-unq', role: 'USER' }]));
      if (url.includes('/admin/upgrade-requests')) return Promise.resolve(mockRes([{ id: 'r1', requesterUsername: 'req1', status: 'PENDING' }]));
      if (url.includes('/admin/topups')) return Promise.resolve(mockRes([{ transactionId: 't1', amount: 100 }]));
      return Promise.resolve(mockRes([]));
    });
    
    render(<AdminPortal />);
    await act(async () => {});
    
    await act(async () => { fireEvent.click(screen.getByText(/User Registry/i)); });
    expect(await screen.findByText('un1-unq')).toBeInTheDocument();
  });

  it('handles request actions', async () => {
    (apiFetch as jest.Mock).mockImplementation((url, opts) => {
      if (url.includes('/admin/users')) return Promise.resolve(mockRes([]));
      if (url.includes('/admin/upgrade-requests') && (!opts || opts.method === 'GET')) return Promise.resolve(mockRes([{ id: 'r1-unq', requesterUsername: 'u1-unq', status: 'PENDING' }]));
      if (url.includes('/admin/topups')) return Promise.resolve(mockRes([]));
      if (opts?.method === 'PATCH') return Promise.resolve(mockRes({ success: true }));
      return Promise.resolve(mockRes([]));
    });
    
    render(<AdminPortal />);
    await act(async () => {});
    
    await act(async () => { fireEvent.click(screen.getByText(/Upgrade Requests/i)); });
    
    const approveBtns = await screen.findAllByText('APPROVE');
    await act(async () => { fireEvent.click(approveBtns[0]); });
    
    expect(await screen.findByText(/Successfully approved/i)).toBeInTheDocument();
  });

  it('handles request action failure', async () => {
    (apiFetch as jest.Mock).mockImplementation((url, opts) => {
      if (url.includes('/admin/users')) return Promise.resolve(mockRes([]));
      if (url.includes('/admin/upgrade-requests') && (!opts || opts.method === 'GET')) return Promise.resolve(mockRes([{ id: 'r1-unq', requesterUsername: 'u1-unq', status: 'PENDING' }]));
      if (url.includes('/admin/topups')) return Promise.resolve(mockRes([]));
      if (opts?.method === 'PATCH') return Promise.resolve({ ok: false, status: 400, json: async () => ({ message: 'MsgFail' }) });
      return Promise.resolve(mockRes([]));
    });
    
    render(<AdminPortal />);
    await act(async () => {});
    
    await act(async () => { fireEvent.click(screen.getByText(/Upgrade Requests/i)); });
    
    const rejectBtns = await screen.findAllByText('REJECT');
    await act(async () => { fireEvent.click(rejectBtns[0]); });
    
    expect(await screen.findByText('MsgFail')).toBeInTheDocument();
  });
});
