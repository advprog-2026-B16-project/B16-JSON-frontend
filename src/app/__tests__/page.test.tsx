import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '../page';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('HomePage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
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

  it('renders the title JSON', () => {
    render(<HomePage />);
    const elements = screen.getAllByText('JSON');
    expect(elements.length).toBeGreaterThan(0);
    expect(elements[0]).toBeInTheDocument();
  });

  it('renders the full title Jastip Online Nasional', () => {
    render(<HomePage />);
    const elements = screen.getAllByText(/Jastip Online Nasional/i);
    expect(elements.length).toBeGreaterThan(0);
    expect(elements[0]).toBeInTheDocument();
  });

  it('renders the Explore Now button', () => {
    render(<HomePage />);
    expect(screen.getByRole('button', { name: /Explore Now/i })).toBeInTheDocument();
  });

  it('redirects to /login when clicking Explore Now and not authenticated', async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    render(<HomePage />);
    
    const exploreButton = screen.getByRole('button', { name: /Explore Now/i });
    
    await waitFor(() => {
      expect(window.localStorage.getItem).toHaveBeenCalled();
    });
    
    // Wait for the setTimeout state update to finish
    await new Promise((r) => setTimeout(r, 0));
    
    fireEvent.click(exploreButton);
    
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('redirects to /dashboard when clicking Explore Now and authenticated', async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue('mock-token');
    render(<HomePage />);
    
    const exploreButton = screen.getByRole('button', { name: /Explore Now/i });
    
    await waitFor(() => {
      expect(window.localStorage.getItem).toHaveBeenCalled();
    });
    
    // Wait for the setTimeout state update to finish
    await new Promise((r) => setTimeout(r, 0));
    
    fireEvent.click(exploreButton);
    
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('renders feature cards', () => {
    render(<HomePage />);
    expect(screen.getByText('Aman & Terpercaya')).toBeInTheDocument();
    expect(screen.getByText('Jangkauan Luas')).toBeInTheDocument();
    expect(screen.getByText('Proses Cepat')).toBeInTheDocument();
  });

  it('toggles mobile menu and navigates from it', async () => {
    render(<HomePage />);
    
    const buttons = screen.getAllByRole('button');
    const toggleButton = buttons.find(b => b.classList.contains('md:hidden')) as HTMLElement;
    
    fireEvent.click(toggleButton);
    
    const mobileLoginButtons = screen.getAllByRole('button', { name: /Login/i });
    const mobileLoginBtn = mobileLoginButtons[1];
    
    fireEvent.click(mobileLoginBtn);
    expect(mockPush).toHaveBeenCalledWith('/login');
    
    fireEvent.click(toggleButton);
    const howItWorksLink = screen.getAllByText('How it works')[1]; // mobile link
    fireEvent.click(howItWorksLink);

    // click Pricing and About in mobile menu
    fireEvent.click(toggleButton);
    const pricingLink = screen.getAllByText('Pricing')[1]; // mobile link
    fireEvent.click(pricingLink);

    fireEvent.click(toggleButton);
    const aboutLink = screen.getAllByText('About')[1]; // mobile link
    fireEvent.click(aboutLink);
  });

  it('clicks desktop menu links without crashing', () => {
    render(<HomePage />);
    // Just click to ensure onClick handlers don't crash
    const desktopLoginBtn = screen.getAllByRole('button', { name: /Login/i })[0];
    fireEvent.click(desktopLoginBtn);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
