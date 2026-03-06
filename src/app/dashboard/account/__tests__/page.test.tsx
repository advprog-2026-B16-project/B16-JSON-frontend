import { render, screen } from '@testing-library/react';
import Page from '../page';

describe('Account Page', () => {
  it('renders correctly', () => {
    render(<Page />);
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });
});
