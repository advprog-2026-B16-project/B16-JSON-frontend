import { render, screen } from '@testing-library/react';
import HomeClient from '../HomeClient';

describe('HomeClient', () => {
  it('renders the title JSON', () => {
    render(<HomeClient isAuthenticated={false} />);
    const elements = screen.getAllByText('JSON');
    expect(elements.length).toBeGreaterThan(0);
    expect(elements[0]).toBeInTheDocument();
  });

  it('renders the main hero text', () => {
    render(<HomeClient isAuthenticated={false} />);
    expect(screen.getByText(/Beli Apa Saja/i)).toBeInTheDocument();
  });

  it('shows Login button when not authenticated', () => {
    render(<HomeClient isAuthenticated={false} />);
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('shows Dashboard button when authenticated', () => {
    render(<HomeClient isAuthenticated={true} />);
    expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
  });
});
