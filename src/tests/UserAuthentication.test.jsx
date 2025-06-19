import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../translations/i18n';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { login, register } from '../utils/api';

// Mock the API functions
jest.mock('../utils/api', () => ({
  login: jest.fn(),
  register: jest.fn(),
  getToken: jest.fn(),
  setToken: jest.fn(),
  removeToken: jest.fn(),
}));

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
});

// Wrapper component for providers
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  </BrowserRouter>
);

describe('User Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LoginForm', () => {
    test('renders login form correctly', () => {
      render(
        <TestWrapper>
          <LoginForm onLoginSuccess={jest.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText('Sign in to BSN')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    test('shows error for empty fields', async () => {
      const mockOnLoginSuccess = jest.fn();
      render(
        <TestWrapper>
          <LoginForm onLoginSuccess={mockOnLoginSuccess} />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter both email and password')).toBeInTheDocument();
      });
      expect(mockOnLoginSuccess).not.toHaveBeenCalled();
    });

    test('handles successful login', async () => {
      const mockOnLoginSuccess = jest.fn();
      login.mockResolvedValue({ access_token: 'test-token' });

      render(
        <TestWrapper>
          <LoginForm onLoginSuccess={mockOnLoginSuccess} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(login).toHaveBeenCalledWith('test@example.com', 'password123');
      });

      await waitFor(() => {
        expect(mockOnLoginSuccess).toHaveBeenCalled();
      });
    });

    test('handles login error', async () => {
      const mockOnLoginSuccess = jest.fn();
      login.mockRejectedValue(new Error('Invalid credentials'));

      render(
        <TestWrapper>
          <LoginForm onLoginSuccess={mockOnLoginSuccess} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
      expect(mockOnLoginSuccess).not.toHaveBeenCalled();
    });

    test('shows loading state during submission', async () => {
      login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <TestWrapper>
          <LoginForm onLoginSuccess={jest.fn()} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Signing In...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('RegisterForm', () => {
    test('renders register form correctly', () => {
      render(
        <TestWrapper>
          <RegisterForm onRegisterSuccess={jest.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText('Create BSN Account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your_username')).toBeInTheDocument();
      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      expect(passwordFields.length).toBe(2);
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    test('validates required fields', async () => {
      const mockOnRegisterSuccess = jest.fn();
      render(
        <TestWrapper>
          <RegisterForm onRegisterSuccess={mockOnRegisterSuccess} />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      // Prüfe, dass der Submit-Button nicht deaktiviert ist (da keine Validierung stattfindet)
      // und dass die Registrierung nicht aufgerufen wurde
      expect(submitButton).not.toBeDisabled();
      expect(mockOnRegisterSuccess).not.toHaveBeenCalled();
      
      // Prüfe, dass die HTML5-Validierung aktiv ist
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const usernameInput = screen.getByPlaceholderText('your_username');
      const passwordInput = screen.getAllByPlaceholderText('••••••••')[0];
      
      expect(emailInput).toHaveAttribute('required');
      expect(usernameInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });

    test('validates password confirmation', async () => {
      const mockOnRegisterSuccess = jest.fn();
      render(
        <TestWrapper>
          <RegisterForm onRegisterSuccess={mockOnRegisterSuccess} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const usernameInput = screen.getByPlaceholderText('your_username');
      const [passwordInput, confirmPasswordInput] = screen.getAllByPlaceholderText('••••••••');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
      expect(mockOnRegisterSuccess).not.toHaveBeenCalled();
    });

    test('validates password length', async () => {
      const mockOnRegisterSuccess = jest.fn();
      render(
        <TestWrapper>
          <RegisterForm onRegisterSuccess={mockOnRegisterSuccess} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const usernameInput = screen.getByPlaceholderText('your_username');
      const [passwordInput, confirmPasswordInput] = screen.getAllByPlaceholderText('••••••••');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
      });
      expect(mockOnRegisterSuccess).not.toHaveBeenCalled();
    });

    test('handles successful registration', async () => {
      const mockOnRegisterSuccess = jest.fn();
      register.mockResolvedValue({ message: 'Registration successful' });

      render(
        <TestWrapper>
          <RegisterForm onRegisterSuccess={mockOnRegisterSuccess} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const usernameInput = screen.getByPlaceholderText('your_username');
      const [passwordInput, confirmPasswordInput] = screen.getAllByPlaceholderText('••••••••');
      const termsCheckbox = screen.getByRole('checkbox');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(register).toHaveBeenCalledWith({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          wallet_address: ''
        });
      });

      await waitFor(() => {
        expect(mockOnRegisterSuccess).toHaveBeenCalled();
      });
    });

    test('handles registration error', async () => {
      const mockOnRegisterSuccess = jest.fn();
      register.mockRejectedValue(new Error('Email already exists'));

      render(
        <TestWrapper>
          <RegisterForm onRegisterSuccess={mockOnRegisterSuccess} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const usernameInput = screen.getByPlaceholderText('your_username');
      const [passwordInput, confirmPasswordInput] = screen.getAllByPlaceholderText('••••••••');
      const termsCheckbox = screen.getByRole('checkbox');

      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });
      expect(mockOnRegisterSuccess).not.toHaveBeenCalled();
    });
  });
}); 