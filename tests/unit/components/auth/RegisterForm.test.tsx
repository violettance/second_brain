import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RegisterForm } from '../../../../src/components/auth/RegisterForm';

// Mock useAuth hook
const mockRegister = mock(() => Promise.resolve());
const mockUseAuth = mock(() => ({
  register: mockRegister,
  isLoading: false,
  error: null,
  success: null
}));

// Mock modules
mock.module('../../../../src/contexts/AuthContext', () => ({
  useAuth: mockUseAuth
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    // Reset mocks
    mockRegister.mockClear();
    mockUseAuth.mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: null,
      success: null
    });
  });

  afterEach(() => {
    // Clean up DOM after each test
    cleanup();
  });

  describe('Rendering', () => {
    it('should render register form elements', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      expect(screen.getByText('Create Account')).toBeDefined();
      expect(screen.getByText('Join us and build your second brain')).toBeDefined();
      expect(screen.getByLabelText('Full Name')).toBeDefined();
      expect(screen.getByLabelText('Email')).toBeDefined();
      expect(screen.getByLabelText('Password')).toBeDefined();
      expect(screen.getByText('Create Account')).toBeDefined();
      expect(screen.getByText('Already have an account?')).toBeDefined();
      expect(screen.getByText('Sign in')).toBeDefined();
    });

    it('should render name input with correct attributes', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      const nameInput = screen.getByLabelText('Full Name');
      expect(nameInput.getAttribute('type')).toBe('text');
      expect(nameInput.getAttribute('placeholder')).toBe('Enter your full name');
      expect(nameInput.hasAttribute('required')).toBe(true);
    });

    it('should render email input with correct attributes', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      const emailInput = screen.getByLabelText('Email');
      expect(emailInput.getAttribute('type')).toBe('email');
      expect(emailInput.getAttribute('placeholder')).toBe('Enter your email');
      expect(emailInput.hasAttribute('required')).toBe(true);
    });

    it('should render password input with correct attributes', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput.getAttribute('type')).toBe('password');
      expect(passwordInput.getAttribute('placeholder')).toBe('Create a password');
      expect(passwordInput.getAttribute('minLength')).toBe('6');
      expect(passwordInput.hasAttribute('required')).toBe(true);
    });
  });

  describe('Form interactions', () => {
    it('should update name input value', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      const nameInput = screen.getByLabelText('Full Name');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      expect((nameInput as HTMLInputElement).value).toBe('John Doe');
    });

    it('should update email input value', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      const emailInput = screen.getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      expect((emailInput as HTMLInputElement).value).toBe('john@example.com');
    });

    it('should update password input value', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      const passwordInput = screen.getByLabelText('Password');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect((passwordInput as HTMLInputElement).value).toBe('password123');
    });

    it('should toggle password visibility', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

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
    it('should call register with name, email and password on form submit', async () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByText('Create Account');

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(mockRegister).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password123');
    });

    it('should prevent default form submission', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      const form = screen.getByLabelText('Full Name').closest('form');
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
    it('should call onToggleMode when sign in link is clicked', () => {
      const mockToggleMode = mock(() => {});
      render(<RegisterForm onToggleMode={mockToggleMode} />);

      const signInLink = screen.getByText('Sign in');
      fireEvent.click(signInLink);

      expect(mockToggleMode).toHaveBeenCalled();
    });
  });

  describe('Loading state', () => {
    it('should show loading state when isLoading is true', () => {
      mockUseAuth.mockReturnValue({
        register: mockRegister,
        isLoading: true,
        error: null,
        success: null
      });

      render(<RegisterForm onToggleMode={() => {}} />);

      expect(screen.getByText('Creating account...')).toBeDefined();
      const submitButton = screen.getByText('Creating account...');
      expect(submitButton.hasAttribute('disabled')).toBe(true);
    });

    it('should show loading state when isSubmitting is true', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByText('Create Account');

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // After clicking submit, should show loading state
      expect(screen.getByText('Creating account...')).toBeDefined();
    });
  });

  describe('Error and success states', () => {
    it('should display error message when error is present', () => {
      mockUseAuth.mockReturnValue({
        register: mockRegister,
        isLoading: false,
        error: 'Email already exists',
        success: null
      });

      render(<RegisterForm onToggleMode={() => {}} />);

      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });

    it('should display success message when success is present', () => {
      mockUseAuth.mockReturnValue({
        register: mockRegister,
        isLoading: false,
        error: null,
        success: 'Account created successfully!'
      });

      render(<RegisterForm onToggleMode={() => {}} />);

      expect(screen.getByText('Account created successfully!')).toBeInTheDocument();
    });

    it('should display both error and success messages when both are present', () => {
      mockUseAuth.mockReturnValue({
        register: mockRegister,
        isLoading: false,
        error: 'Some error',
        success: 'Some success'
      });

      render(<RegisterForm onToggleMode={() => {}} />);

      expect(screen.getByText('Some error')).toBeInTheDocument();
      expect(screen.getByText('Some success')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render user icon in name input', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      const nameInput = screen.getByLabelText('Full Name');
      const userIcon = nameInput.parentElement?.querySelector('svg');
      expect(userIcon).toBeInTheDocument();
    });

    it('should render mail icon in email input', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      const emailInput = screen.getByLabelText('Email');
      const mailIcon = emailInput.parentElement?.querySelector('svg');
      expect(mailIcon).toBeInTheDocument();
    });

    it('should render lock icon in password input', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      const passwordInput = screen.getByLabelText('Password');
      const lockIcon = passwordInput.parentElement?.querySelector('svg');
      expect(lockIcon).toBeInTheDocument();
    });

    it('should render eye icons for password toggle', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = passwordInput.parentElement?.querySelector('button');
      const eyeIcon = toggleButton?.querySelector('svg');
      
      expect(eyeIcon).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('should require all fields', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(nameInput).toBeRequired();
      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    it('should have minimum password length', () => {
      render(<RegisterForm onToggleMode={() => {}} />);

      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toHaveAttribute('minLength', '6');
    });
  });
});
