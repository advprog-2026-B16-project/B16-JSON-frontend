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

    it('navigates to register page when clicking Create an Account', () => {
      render(<LoginPage />);
      const registerBtn = screen.getByRole('button', { name: /Create an Account/i });
      fireEvent.click(registerBtn);
      expect(mockPush).toHaveBeenCalledWith('/register');
    });

    it('submits login data to backend', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'mock-token' }),
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
  });
});
