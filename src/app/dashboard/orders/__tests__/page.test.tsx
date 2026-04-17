import { render, screen } from '@testing-library/react';
import Page from '../page';

describe('Orders Page', () => {
  it('renders correctly', () => {
    render(<Page />);
    // Select the h1 specifically
    const headings = screen.getAllByText(/Jastip Orders/i);
    expect(headings[0]).toBeInTheDocument();
  });
});
