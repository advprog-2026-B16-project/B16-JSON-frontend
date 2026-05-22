import { render, screen, waitFor } from '@testing-library/react';
import Page from '../page';
import { getProfile } from '../../settings/actions';

jest.mock('../../settings/actions', () => ({
  getProfile: jest.fn(),
}));

describe('Account Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getProfile as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 'user-1',
        username: 'testuser',
        email: 'test@test.com',
        fullName: 'Test User',
        bio: 'Hello',
        location: 'Jakarta',
        role: 'USER',
        status: 'ACTIVE',
      },
    });
  });

  it('renders profile data', async () => {
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/test@test.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Jakarta/i)).toBeInTheDocument();
  });
});
