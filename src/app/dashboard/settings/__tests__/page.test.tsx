import { render, screen, act, cleanup } from '@testing-library/react';
import SettingsPage from '../page';
import * as actions from '../actions';
import { ReactNode } from 'react';

// Mock the server actions
jest.mock('../actions', () => ({
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
}));

// Mock PasswordStrengthMeter
jest.mock('../../../../components/PasswordStrengthMeter', () => ({
  __esModule: true,
  default: () => <div data-testid="password-strength-meter" />
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  const IconMock = (props: Record<string, unknown>) => <svg data-testid="icon" {...props} />;
  return {
    UserCircle: IconMock,
    Bell: IconMock,
    Lock: IconMock,
    Globe: IconMock,
    Settings: IconMock,
    HelpCircle: IconMock,
    LogOut: IconMock,
    Camera: IconMock,
    Mail: IconMock,
    User: IconMock,
    MapPin: IconMock,
    Loader2: IconMock,
    Save: IconMock,
  };
});

describe('Settings Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (actions.getProfile as jest.Mock).mockResolvedValue({ 
      success: true, 
      data: { username: 'testuser', email: 'test@test.com', bio: 'Hello', location: 'Earth' } 
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', async () => {
    await act(async () => {
      render(<SettingsPage />);
    });
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    expect(await screen.findByText(/testuser/i)).toBeInTheDocument();
  });
});
