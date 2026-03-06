import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardClient from '../DashboardClient';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe('DashboardClient', () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
    // @ts-ignore
    (require('next/navigation').usePathname as jest.Mock).mockReturnValue('/dashboard/home');
    global.fetch = jest.fn();
  });

  it('renders common navigation items', () => {
    render(
      <DashboardClient isJastiper={false} isAdmin={false}>
        <div>Content</div>
      </DashboardClient>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders Jastiper items only when isJastiper is true', () => {
    const { rerender } = render(
      <DashboardClient isJastiper={false} isAdmin={false}>
        <div>Content</div>
      </DashboardClient>
    );
    expect(screen.queryByText('Catalogue')).not.toBeInTheDocument();

    rerender(
      <DashboardClient isJastiper={true} isAdmin={false}>
        <div>Content</div>
      </DashboardClient>
    );
    expect(screen.getByText('Catalogue')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('renders Admin items only when isAdmin is true', () => {
    const { rerender } = render(
      <DashboardClient isJastiper={false} isAdmin={false}>
        <div>Content</div>
      </DashboardClient>
    );
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();

    rerender(
      <DashboardClient isJastiper={false} isAdmin={true}>
        <div>Content</div>
      </DashboardClient>
    );
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('toggles mobile menu', async () => {
    render(
      <DashboardClient isJastiper={false} isAdmin={false}>
        <div>Content</div>
      </DashboardClient>
    );
    
    // Desktop menu labels are visible
    expect(screen.getAllByText('Home').length).toBe(1);

    // Click the toggle button (it's the one with the Menu icon)
    const toggleBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleBtn);
    
    // Now mobile menu should be open, showing a second 'Home' label
    await waitFor(() => {
      expect(screen.getAllByText('Home').length).toBe(2);
    });
  });

  it('handles logout correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    
    render(
      <DashboardClient isJastiper={false} isAdmin={false}>
        <div>Content</div>
      </DashboardClient>
    );
    
    const logoutBtn = screen.getByRole('button', { name: /Logout/i });
    fireEvent.click(logoutBtn);

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
