import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { LoginForm } from '@/features/auth/components/login-form';

function renderLoginForm(props?: Partial<React.ComponentProps<typeof LoginForm>>) {
  const defaults = {
    onSubmit: vi.fn(),
    onGithubLogin: vi.fn(),
    onGoogleLogin: vi.fn(),
  };
  render(
    <MemoryRouter>
      <LoginForm {...defaults} {...props} />
    </MemoryRouter>,
  );
  return defaults;
}

// ShadCN FormControl wraps inputs in a <div> so getByLabelText doesn't work.
// Use placeholder text to target inputs instead.
const emailInput = () => screen.getByPlaceholderText('you@example.com');
const passwordInput = () => screen.getByPlaceholderText('••••••••');
const submitBtn = () => screen.getByRole('button', { name: /^sign in$/i });

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    renderLoginForm();
    expect(emailInput()).toBeInTheDocument();
    expect(passwordInput()).toBeInTheDocument();
  });

  it('submit button is disabled while fields are empty', () => {
    renderLoginForm();
    expect(submitBtn()).toBeDisabled();
  });

  it('submit button enables once valid credentials are entered', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(emailInput(), 'test@example.com');
    await user.type(passwordInput(), 'password123');

    expect(submitBtn()).toBeEnabled();
  });

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(emailInput(), 'not-an-email');
    await user.tab();

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it('calls onSubmit with email and password on valid submission', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderLoginForm();

    await user.type(emailInput(), 'test@example.com');
    await user.type(passwordInput(), 'password123');
    await user.click(submitBtn());

    expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' }, expect.anything());
  });

  it('displays API error message when error prop is set', () => {
    renderLoginForm({ error: 'Invalid credentials' });
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('disables submit button while isLoading is true', async () => {
    const user = userEvent.setup();
    renderLoginForm({ isLoading: true });

    await user.type(emailInput(), 'test@example.com');
    await user.type(passwordInput(), 'password123');

    expect(submitBtn()).toBeDisabled();
  });

  it('calls onForgotPassword when forgot password link is clicked', async () => {
    const user = userEvent.setup();
    const onForgotPassword = vi.fn();
    renderLoginForm({ onForgotPassword });

    await user.click(screen.getByRole('button', { name: /forgot password/i }));
    expect(onForgotPassword).toHaveBeenCalledOnce();
  });
});
