import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Page from '../page';
import { apiFetch } from '../../../../lib/api';

// Mock apiFetch
jest.mock('../../../../lib/api', () => ({
  apiFetch: jest.fn(),
}));

describe('Admin Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiFetch as jest.Mock).mockImplementation((endpoint) => {
      if (endpoint === '/user/getUsers') {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, name: 'Alice Smith', email: 'alice@test.com', role: 'ADMIN', status: 'Active' }],
        });
      }
      if (endpoint === '/upgrade-request/get-requests') {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 'REQ-1', name: 'John Doe', status: 'Pending', reason: 'Test' }],
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });
  });

  it('renders admin command center', async () => {
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByText(/Admin Command Center/i)).toBeInTheDocument();
    });
  });

  it('switches tabs correctly', async () => {
    render(<Page />);
    
    const userTab = await screen.findByRole('button', { name: /User Management/i });
    fireEvent.click(userTab);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search users/i)).toBeInTheDocument();
    });
  });

  it('handles request actions', async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) });
    
    render(<Page />);

    const requestTab = await screen.findByRole('button', { name: /Upgrade Requests/i });
    fireEvent.click(requestTab);

    const approveBtn = await screen.findByRole('button', { name: /APPROVE/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('change-status'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });
});
