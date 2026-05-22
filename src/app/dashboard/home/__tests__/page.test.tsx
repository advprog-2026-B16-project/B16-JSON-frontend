import { render, screen, act } from '@testing-library/react';
import Page from '../page';

describe('Simple Dashboard Pages', () => {
  it('renders Dashboard Home', async () => {
    const ResolvedPage = await Page();
    await act(async () => {
      render(ResolvedPage);
    });
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
  });
});
