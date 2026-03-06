import { render, screen } from '@testing-library/react';
import Page from '../page';

describe('Jastiper Upgrade Page', () => {
  it('renders correctly', () => {
    render(<Page />);
    const elements = screen.getAllByText(/Become a Jastiper/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});
