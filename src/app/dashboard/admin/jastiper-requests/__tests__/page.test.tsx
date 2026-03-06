import { render, screen } from '@testing-library/react';
import Page from '../page';

describe('Admin Sub-pages', () => {
  it('renders Jastiper Requests', () => {
    render(<Page />);
    expect(screen.getByText(/Jastiper Requests/i)).toBeInTheDocument();
  });
});
