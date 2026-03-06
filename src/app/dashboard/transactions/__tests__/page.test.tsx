import { render, screen } from '@testing-library/react';
import Page from '../page';

describe('Transactions Page', () => {
  it('renders correctly', () => {
    render(<Page />);
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });
});
