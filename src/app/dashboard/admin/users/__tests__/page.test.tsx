import { render, screen, act, cleanup } from '@testing-library/react';
import AllUsersPage from '../page';
import { apiFetch } from '../../../../../lib/api';

jest.mock('../../../../../lib/api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('lucide-react', () => {
  const IconMock = (props: any) => <svg data-testid="icon" {...props} />;
  return {
    Users: IconMock, Search: IconMock, Mail: IconMock, 
    Loader2: IconMock, ShieldCheck: IconMock,
  };
});

describe('AllUsersPage 100% Final Precision', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const mockRes = (data: any, ok = true) => ({
    ok,
    status: ok ? 200 : 500,
    json: async () => data,
  });

  it('exhausts all fetch and normalization branches strictly', async () => {
    // getUsers ok, Array branch
    (apiFetch as jest.Mock).mockResolvedValueOnce(mockRes([{ id: 'u1-unq', username: 'un1-unq', email: 'e1-unq' }]));
    render(<AllUsersPage />);
    expect(await screen.findByText('un1-unq')).toBeInTheDocument();
    cleanup();

    // getUsers ok, users key
    (apiFetch as jest.Mock).mockResolvedValueOnce(mockRes({ users: [{ id: 'u2-unq', username: 'un2-unq' }] }));
    render(<AllUsersPage />);
    expect(await screen.findByText('un2-unq')).toBeInTheDocument();
    cleanup();

    // getUsers fail -> all ok -> fallback (Line 46 else branch)
    // To hit Line 46, response.ok must be false.
    (apiFetch as jest.Mock).mockResolvedValueOnce(mockRes({}, false)); 
    render(<AllUsersPage />);
    expect(await screen.findByText('admin1')).toBeInTheDocument();
    cleanup();

    // throw catch fallback (Line 52)
    (apiFetch as jest.Mock).mockRejectedValue(new Error('Fatal'));
    render(<AllUsersPage />);
    expect(await screen.findByText('erik.wilbert')).toBeInTheDocument();
  });

  it('exhausts filter logic strictly', async () => {
    (apiFetch as jest.Mock).mockResolvedValueOnce(mockRes([
      { id: 'ok-id-unq', username: 'un-ok-1' }, 
      { email: 'ok-email-unq', username: 'un-ok-2' }, 
      { id: 'fail-has-req', upgr_req_id: 'r' },
      { username: 'fail-no-id-email' }
    ]));
    render(<AllUsersPage />);
    expect(await screen.findByText('un-ok-1')).toBeInTheDocument();
    expect(await screen.findByText('un-ok-2')).toBeInTheDocument();
    expect(screen.queryByText('fail-no-id-email')).not.toBeInTheDocument();
  });
});
