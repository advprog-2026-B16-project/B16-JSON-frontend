import { render, screen } from '@testing-library/react';
import Page from '../page';

describe('Marketplace Page', () => {
  it('renders correctly', () => {
    render(<Page />);
    expect(screen.getByText(/Marketplace/i)).toBeInTheDocument();
  });
});
