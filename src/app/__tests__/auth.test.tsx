import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../login/page';
import RegisterPage from '../register/page';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Authentication Pages', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    global.fetch = jest.fn();
    process.env.NEXT_PUBLIC_API_URL = '/auth';
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe('LoginPage', () => {
    it('renders login form correctly', () => {
      render(<LoginPage />);
      expect(screen.getByText(/Login/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    it('navigates back to home when clicking Back to Home', () => {
      render(<LoginPage />);
      const backBtn = screen.getByRole('button', { name: /Back to Home/i });
      fireEvent.click(backBtn);
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('navigates to register page when clicking Create an Account', () => {
      render(<LoginPage />);
      const registerBtn = screen.getByRole('button', { name: /Create an Account/i });
      fireEvent.click(registerBtn);
      expect(mockPush).toHaveBeenCalledWith('/register');
    });

    it('toggles password visibility', () => {
      render(<LoginPage />);
      const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
      expect(passwordInput.type).toBe('password');
      
      const toggleBtn = screen.getByRole('button', { hidden: true, name: '' });
      fireEvent.click(toggleBtn);
      expect(passwordInput.type).toBe('text');
      
      fireEvent.click(toggleBtn);
      expect(passwordInput.type).toBe('password');
    });

    it('submits login data to backend', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'mock-token', user: { role: 'USER' } }),
      });

      render(<LoginPage />);
      
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Enter JSON/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
          })
        );
      });
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/home');
      });
    });

    it('handles login failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      });

      render(<LoginPage />);
      
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpassword' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Enter JSON/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('handles login failure with default message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      render(<LoginPage />);
      
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpassword' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Enter JSON/i }));

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
    });

    it('handles registration failure with default message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      render(<RegisterPage />);
      
      fireEvent.change(screen.getByPlaceholderText('johndoe'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], { target: { value: 'password123' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[1], { target: { value: 'password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Join JSON/i }));

      await waitFor(() => {
        expect(screen.getByText('Registration failed')).toBeInTheDocument();
      });
    });

    it('handles registration failure with non-object response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => 'Just a string error',
      });

      render(<RegisterPage />);
      
      fireEvent.change(screen.getByPlaceholderText('johndoe'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], { target: { value: 'password123' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[1], { target: { value: 'password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Join JSON/i }));

      await waitFor(() => {
        expect(screen.getByText('Registration failed')).toBeInTheDocument();
      });
    });

    it('handles fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<LoginPage />);
      
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpassword' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Enter JSON/i }));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
    it('handles fetch error that is not an Error instance', async () => {
      // eslint-disable-next-line no-throw-literal
      (global.fetch as jest.Mock).mockRejectedValueOnce('Some string error');

      render(<LoginPage />);
      
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpassword' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Enter JSON/i }));

      await waitFor(() => {
        expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('RegisterPage', () => {
    it('renders register form correctly', () => {
      render(<RegisterPage />);
      expect(screen.getByText(/Register/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Username$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    });

    it('navigates back to login when clicking Back to Login', () => {
      render(<RegisterPage />);
      const backBtn = screen.getByRole('button', { name: /Back to Login/i });
      fireEvent.click(backBtn);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('navigates to login page when clicking Login Instead', () => {
      render(<RegisterPage />);
      const loginBtn = screen.getByRole('button', { name: /Login Instead/i });
      fireEvent.click(loginBtn);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('toggles password visibility', () => {
      render(<RegisterPage />);
      const passwordInput = screen.getAllByPlaceholderText('••••••••')[0] as HTMLInputElement;
      expect(passwordInput.type).toBe('password');
      
      // The toggle button is the one inside the password relative div
      const buttons = screen.getAllByRole('button');
      // The toggle button is before the submit button, typically the first one without text
      const toggleBtn = buttons.find(b => b.querySelector('svg.lucide-eye') || b.querySelector('svg.lucide-eye-off')) as HTMLElement;
      
      fireEvent.click(toggleBtn);
      expect(passwordInput.type).toBe('text');
      
      fireEvent.click(toggleBtn);
      expect(passwordInput.type).toBe('password');
    });

    it('validates matching passwords', async () => {
      render(<RegisterPage />);
      
      fireEvent.change(screen.getByPlaceholderText('johndoe'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], { target: { value: 'password123' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[1], { target: { value: 'mismatch' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Join JSON/i }));

      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('submits registration data to backend', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<RegisterPage />);
      
      fireEvent.change(screen.getByPlaceholderText('johndoe'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], { target: { value: 'password123' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[1], { target: { value: 'password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Join JSON/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/register'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              username: 'testuser',
              email: 'test@example.com',
              password: 'password123',
            }),
          })
        );
      });
    });
    it('handles registration failure with object error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ email: 'Email already exists' }),
      });

      render(<RegisterPage />);
      
      fireEvent.change(screen.getByPlaceholderText('johndoe'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], { target: { value: 'password123' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[1], { target: { value: 'password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Join JSON/i }));

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });
    });

    it('handles registration failure with message string', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Server error occurred' }),
      });

      render(<RegisterPage />);
      
      fireEvent.change(screen.getByPlaceholderText('johndoe'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], { target: { value: 'password123' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[1], { target: { value: 'password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Join JSON/i }));

      await waitFor(() => {
        expect(screen.getByText('Server error occurred')).toBeInTheDocument();
      });
    });

    it('handles login failure with default message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      render(<LoginPage />);
      
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpassword' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Enter JSON/i }));

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
    });

    it('handles registration failure with default message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      render(<RegisterPage />);
      
      fireEvent.change(screen.getByPlaceholderText('johndoe'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], { target: { value: 'password123' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[1], { target: { value: 'password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Join JSON/i }));

      await waitFor(() => {
        expect(screen.getByText('Registration failed')).toBeInTheDocument();
      });
    });

    it('handles registration failure with non-object response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => 'Just a string error',
      });

      render(<RegisterPage />);
      
      fireEvent.change(screen.getByPlaceholderText('johndoe'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], { target: { value: 'password123' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[1], { target: { value: 'password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Join JSON/i }));

      await waitFor(() => {
        expect(screen.getByText('Registration failed')).toBeInTheDocument();
      });
    });

    it('handles fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<RegisterPage />);
      
      fireEvent.change(screen.getByPlaceholderText('johndoe'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], { target: { value: 'password123' } });
      fireEvent.change(screen.getAllByPlaceholderText('••••••••')[1], { target: { value: 'password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Join JSON/i }));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });
});
