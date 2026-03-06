import { render, screen } from '@testing-library/react';
import Page from '../page';

describe('Admin Users Page', () => {
  it('renders correctly', () => {
    render(<Page />);
    expect(screen.getByText(/All Users/i)).toBeInTheDocument();
  });
});
