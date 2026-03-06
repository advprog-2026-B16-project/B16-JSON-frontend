import { render, screen } from '@testing-library/react';
import Page from '../page';

describe('Settings Page', () => {
  it('renders correctly', () => {
    render(<Page />);
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
  });
});
