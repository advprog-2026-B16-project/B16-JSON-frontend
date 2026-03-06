import { render, screen } from '@testing-library/react';
import Page from '../page';

describe('Catalogue Page', () => {
  it('renders correctly', () => {
    render(<Page />);
    expect(screen.getByText(/Your Catalogue/i)).toBeInTheDocument();
  });
});
