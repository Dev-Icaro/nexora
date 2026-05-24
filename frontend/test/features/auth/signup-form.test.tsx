import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { SignupForm } from '@/features/auth/components/signup-form';

function renderSignupForm(props?: Partial<React.ComponentProps<typeof SignupForm>>) {
  const defaults = {
    onSubmit: vi.fn(),
    onGithubLogin: vi.fn(),
    onGoogleLogin: vi.fn(),
  };
  render(
    <MemoryRouter>
      <SignupForm {...defaults} {...props} />
    </MemoryRouter>,
  );
  return defaults;
}

// ShadCN FormControl wraps inputs in a <div> so getByLabelText doesn't work.
// Use placeholder text to target inputs instead.
const usernameInput = () => screen.getByPlaceholderText('johndoe');
const emailInput = () => screen.getByPlaceholderText('you@example.com');
const passwordInputs = () => screen.getAllByPlaceholderText('••••••••');
const passwordInput = () => passwordInputs()[0];
const confirmInput = () => passwordInputs()[1];
const submitBtn = () => screen.getByRole('button', { name: /create account/i });

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(usernameInput(), 'newuser');
  await user.type(emailInput(), 'new@example.com');
  await user.type(passwordInput(), 'StrongPass1!');
  await user.type(confirmInput(), 'StrongPass1!');
}

describe('SignupForm', () => {
  it('renders all four fields', () => {
    renderSignupForm();
    expect(usernameInput()).toBeInTheDocument();
    expect(emailInput()).toBeInTheDocument();
    expect(passwordInputs()).toHaveLength(2);
  });

  it('submit button is disabled when form is empty', () => {
    renderSignupForm();
    expect(submitBtn()).toBeDisabled();
  });

  it('submit button enables when all fields are valid', async () => {
    const user = userEvent.setup();
    renderSignupForm();

    await fillValidForm(user);

    expect(submitBtn()).toBeEnabled();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderSignupForm();

    await user.type(usernameInput(), 'newuser');
    await user.type(emailInput(), 'new@example.com');
    await user.type(passwordInput(), 'StrongPass1!');
    await user.type(confirmInput(), 'DifferentPass1!');
    await user.tab();

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid username characters', async () => {
    const user = userEvent.setup();
    renderSignupForm();

    await user.type(usernameInput(), 'invalid user!');
    await user.tab();

    expect(await screen.findByText(/letters, numbers/i)).toBeInTheDocument();
  });

  it('calls onSubmit with all field values on valid submission', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderSignupForm();

    await fillValidForm(user);
    await user.click(submitBtn());

    expect(onSubmit).toHaveBeenCalledWith(
      {
        username: 'newuser',
        email: 'new@example.com',
        password: 'StrongPass1!',
        confirmPassword: 'StrongPass1!',
      },
      expect.anything(),
    );
  });

  it('displays API error when error prop is set', () => {
    renderSignupForm({ error: 'Email already in use' });
    expect(screen.getByText('Email already in use')).toBeInTheDocument();
  });

  it('disables submit while isLoading is true', async () => {
    const user = userEvent.setup();
    renderSignupForm({ isLoading: true });

    await fillValidForm(user);

    expect(submitBtn()).toBeDisabled();
  });
});
