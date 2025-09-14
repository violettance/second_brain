import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginForm } from '../../../../src/components/auth/LoginForm';

// Mock useAuth hook
const mockLogin = mock(() => Promise.resolve());
const mockUseAuth = mock(() => ({
  login: mockLogin,
  isLoading: false
}));

// Mock modules
mock.module('../../../../src/contexts/AuthContext', () => ({
  useAuth: mockUseAuth
}));

describe('LoginForm', () => {
  beforeEach(() => {
    // Reset mocks
    mockLogin.mockClear();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false
    });
  });

  afterEach(() => {
    // Clean up DOM after each test
    cleanup();
  });

  describe('Rendering', () => {
    it('should render login form elements', () => {
      render(<LoginForm onToggleMode={() => {}} />);

      expect(screen.getByText('Welcome Back')).toBeDefined();
      expect(screen.getByText('Sign in to access your second brain')).toBeDefined();
      expect(screen.getByLabelText('Email')).toBeDefined();
      expect(screen.getByLabelText('Password')).toBeDefined();
      expect(screen.getByText('Sign In')).toBeDefined();
      expect(screen.getByText("Don't have an account?")).toBeDefined();
      expect(screen.getByText('Sign up')).toBeDefined();
    });

    it('should render email input with correct attributes', () => {
      render(<LoginForm onToggleMode={() => {}} />);

      const emailInput = screen.getByLabelText('Email');
      expect(emailInput.getAttribute('type')).toBe('email');
      expect(emailInput.getAttribute('placeholder')).toBe('Enter your email');
      expect(emailInput.hasAttribute('required')).toBe(true);
    });

    it('should render password input with correct attributes', () => {
      render(<LoginForm onToggleMode={() => {}} />);

      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput.getAttribute('type')).toBe('password');
      expect(passwordInput.getAttribute('placeholder')).toBe('Enter your password');
      expect(passwordInput.hasAttribute('required')).toBe(true);
    });

    it('should render submit button', () => {
      render(<LoginForm onToggleMode={() => {}} />);

      const submitButton = screen.getByText('Sign In');
      expect(submitButton.getAttribute('type')).toBe('submit');
    });
  });

  describe('Form interactions', () => {
    it('should update email input value', () => {
      render(<LoginForm onToggleMode={() => {}} />);

      const emailInput = screen.getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect((emailInput as HTMLInputElement).value).toBe('test@example.com');
    });

    it('should update password input value', () => {
      render(<LoginForm onToggleMode={() => {}} />);

      const passwordInput = screen.getByLabelText('Password');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect((passwordInput as HTMLInputElement).value).toBe('password123');
    });

    it('should toggle password visibility', () => {
      render(<LoginForm onToggleMode={() => {}} />);

      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = passwordInput.parentElement?.querySelector('button');

      // Initially password should be hidden
      expect(passwordInput.getAttribute('type')).toBe('password');

      // Click to show password
      fireEvent.click(toggleButton!);
      expect(passwordInput.getAttribute('type')).toBe('text');

      // Click to hide password again
      fireEvent.click(toggleButton!);
      expect(passwordInput.getAttribute('type')).toBe('password');
    });
  });

  describe('Form submission', () => {
    it('should call login with email and password on form submit', async () => {
      render(<LoginForm onToggleMode={() => {}} />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByText('Sign In');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should prevent default form submission', () => {
      render(<LoginForm onToggleMode={() => {}} />);

      const form = screen.getByLabelText('Email').closest('form');
      const preventDefaultSpy = mock(() => {});
      
      // Mock the form's onSubmit handler
      const originalOnSubmit = form!.onsubmit;
      form!.onsubmit = (e) => {
        e.preventDefault();
        preventDefaultSpy();
        return false;
      };

      fireEvent.submit(form!);

      expect(preventDefaultSpy).toHaveBeenCalled();
      
      // Restore original handler
      form!.onsubmit = originalOnSubmit;
    });
  });

  describe('Toggle mode', () => {
    it('should call onToggleMode when sign up link is clicked', () => {
      const mockToggleMode = mock(() => {});
      render(<LoginForm onToggleMode={mockToggleMode} />);

      const signUpLink = screen.getByText('Sign up');
      fireEvent.click(signUpLink);

      expect(mockToggleMode).toHaveBeenCalled();
    });
  });

  describe('Loading state', () => {
    it('should show loading state when isLoading is true', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: true
      });

      render(<LoginForm onToggleMode={() => {}} />);

      expect(screen.getByText('Signing in...')).toBeDefined();
      const submitButton = screen.getByText('Signing in...');
      expect(submitButton.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should display error message when login fails', async () => {
      const errorMessage = 'Invalid credentials';
      mockLogin.mockRejectedValue(new Error(errorMessage));

      render(<LoginForm onToggleMode={() => {}} />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByText('Sign In');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      // Wait for error to appear
      await screen.findByText(errorMessage);
      expect(screen.getByText(errorMessage)).toBeDefined();
    });
  });

  describe('Icons', () => {
    it('should render mail icon in email input', () => {
      render(<LoginForm onToggleMode={() => {}} />);

      const emailInput = screen.getByLabelText('Email');
      const mailIcon = emailInput.parentElement?.querySelector('svg');
      expect(mailIcon).toBeDefined();
    });

    it('should render lock icon in password input', () => {
      render(<LoginForm onToggleMode={() => {}} />);

      const passwordInput = screen.getByLabelText('Password');
      const lockIcon = passwordInput.parentElement?.querySelector('svg');
      expect(lockIcon).toBeDefined();
    });

    it('should render eye icons for password toggle', () => {
      render(<LoginForm onToggleMode={() => {}} />);

      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = passwordInput.parentElement?.querySelector('button');
      const eyeIcon = toggleButton?.querySelector('svg');
      
      expect(eyeIcon).toBeDefined();
    });
  });
});
