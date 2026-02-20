import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '../page';

// Mock the global fetch function
global.fetch = jest.fn();

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page title', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      text: async () => 'Hello from backend',
    });

    render(<HomePage />);

    expect(screen.getByText('Next.js Frontend')).toBeInTheDocument();
  });

  it('renders "Message from Backend:" label', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      text: async () => 'Hello from backend',
    });

    render(<HomePage />);

    expect(screen.getByText(/Message from Backend:/i)).toBeInTheDocument();
  });

  it('displays message from backend on successful fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      text: async () => 'Hello from backend',
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Hello from backend')).toBeInTheDocument();
    });
  });

  it('calls the correct API endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      text: async () => 'some data',
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/user/getUsers`
      );
    });
  });

  it('displays error message when fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to connect to backend.')).toBeInTheDocument();
    });
  });

  it('shows empty message initially before fetch completes', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    render(<HomePage />);

    // message state starts as empty string
    expect(screen.getByText(/Message from Backend:/i)).toBeInTheDocument();
  });
});

