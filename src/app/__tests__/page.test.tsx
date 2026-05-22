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
    expect(screen.getByText(/Titip barang/i)).toBeInTheDocument();
  });

  it('shows Login button when not authenticated', () => {
    render(<HomeClient isAuthenticated={false} />);
    expect(screen.getAllByRole('button', { name: /Login/i }).length).toBeGreaterThan(0);
  });

  it('shows Dashboard button when authenticated', () => {
    render(<HomeClient isAuthenticated={true} />);
    expect(screen.getAllByRole('button', { name: /Dashboard/i }).length).toBeGreaterThan(0);
  });
});
