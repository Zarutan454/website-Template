
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PostHeader from '../PostHeader';
import { BrowserRouter } from 'react-router-dom';

// Mock the navigation function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('PostHeader', () => {
  const mockAuthor = {
    id: '123',
    username: 'testuser',
    display_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    is_verified: true
  };

  const renderComponent = (props = {}) => {
    return render(
      <BrowserRouter>
        <PostHeader 
          author={mockAuthor} 
          created_at="2023-07-15T12:00:00Z"
          {...props} 
        />
      </BrowserRouter>
    );
  };

  it('renders the author name and username', () => {
    renderComponent();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('renders the verification badge for verified users', () => {
    renderComponent();
    const verificationBadge = document.querySelector('.text-blue-500');
    expect(verificationBadge).toBeInTheDocument();
  });

  it('does not render verification badge for non-verified users', () => {
    renderComponent({ author: { ...mockAuthor, is_verified: false } });
    const verificationBadge = document.querySelector('.text-blue-500');
    expect(verificationBadge).not.toBeInTheDocument();
  });

  it('navigates to user profile when clicked', () => {
    renderComponent();
    const nameElement = screen.getByText('Test User');
    fireEvent.click(nameElement);
    expect(mockNavigate).toHaveBeenCalledWith('/profile/testuser');
  });
});
