import { render, screen } from '@testing-library/react';
import Page from '../page';

describe('Simple Dashboard Pages', () => {
  it('renders Dashboard Home', () => {
    render(<Page />);
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
  });
});
