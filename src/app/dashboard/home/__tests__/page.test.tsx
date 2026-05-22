import { render, screen, act } from '@testing-library/react';
import Page from '../page';

describe('Simple Dashboard Pages', () => {
  it('renders Dashboard Home', async () => {
    render(await Page());
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
  });
});
