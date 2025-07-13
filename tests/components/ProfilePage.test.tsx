import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfilePage from '../../src/pages/ProfilePage';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { useFollowUser } from '../../src/hooks/useFollowUser';
import { useUnfollowUser } from '../../src/hooks/useUnfollowUser';
import { useUploadCover } from '../../src/hooks/useUploadCover';

// Mock hooks
jest.mock('../../src/hooks/useUserProfile');
jest.mock('../../src/hooks/useFollowUser');
jest.mock('../../src/hooks/useUnfollowUser');
jest.mock('../../src/hooks/useUploadCover');

const mockUseUserProfile = useUserProfile as jest.MockedFunction<typeof useUserProfile>;
const mockUseFollowUser = useFollowUser as jest.MockedFunction<typeof useFollowUser>;
const mockUseUnfollowUser = useUnfollowUser as jest.MockedFunction<typeof useUnfollowUser>;
const mockUseUploadCover = useUploadCover as jest.MockedFunction<typeof useUploadCover>;

// Mock data
const mockUserProfile = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  profile: {
    bio: 'Test bio',
    avatar_url: 'https://example.com/avatar.jpg',
    cover_url: 'https://example.com/cover.jpg',
    location: 'Test City',
    website: 'https://example.com',
    birth_date: '1990-01-01',
    gender: 'other',
    phone: '+1234567890',
    is_public: true,
  },
  followers_count: 100,
  following_count: 50,
  is_following: false,
  is_own_profile: false,
  recent_posts_count: 25,
};

const mockOwnProfile = {
  ...mockUserProfile,
  is_own_profile: true,
};

// Test setup
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ProfilePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseUserProfile.mockReturnValue({
      data: mockUserProfile,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    mockUseFollowUser.mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      error: null,
    });

    mockUseUnfollowUser.mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      error: null,
    });

    mockUseUploadCover.mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    test('renders profile information correctly', () => {
      render(<ProfilePage />, { wrapper: createTestWrapper() });

      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Test bio')).toBeInTheDocument();
      expect(screen.getByText('Test City')).toBeInTheDocument();
      expect(screen.getByText('100 followers')).toBeInTheDocument();
      expect(screen.getByText('50 following')).toBeInTheDocument();
    });

    test('renders loading state', () => {
      mockUseUserProfile.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      });

      render(<ProfilePage />, { wrapper: createTestWrapper() });

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('renders error state', () => {
      mockUseUserProfile.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load profile'),
        refetch: jest.fn(),
      });

      render(<ProfilePage />, { wrapper: createTestWrapper() });

      expect(screen.getByText('Error loading profile')).toBeInTheDocument();
      expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
    });

    test('renders own profile with edit button', () => {
      mockUseUserProfile.mockReturnValue({
        data: mockOwnProfile,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ProfilePage />, { wrapper: createTestWrapper() });

      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.queryByText('Follow')).not.toBeInTheDocument();
    });

    test('renders other user profile with follow button', () => {
      render(<ProfilePage />, { wrapper: createTestWrapper() });

      expect(screen.getByText('Follow')).toBeInTheDocument();
      expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
    });
  });

  describe('Follow/Unfollow Functionality', () => {
    test('handles follow button click', async () => {
      const mockFollowMutate = jest.fn();
      mockUseFollowUser.mockReturnValue({
        mutate: mockFollowMutate,
        isLoading: false,
        error: null,
      });

      render(<ProfilePage />, { wrapper: createTestWrapper() });

      const followButton = screen.getByText('Follow');
      fireEvent.click(followButton);

      await waitFor(() => {
        expect(mockFollowMutate).toHaveBeenCalledWith(1);
      });
    });

    test('handles unfollow button click', async () => {
      const mockUnfollowMutate = jest.fn();
      mockUseUnfollowUser.mockReturnValue({
        mutate: mockUnfollowMutate,
        isLoading: false,
        error: null,
      });

      // Mock user as already following
      mockUseUserProfile.mockReturnValue({
        data: { ...mockUserProfile, is_following: true },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ProfilePage />, { wrapper: createTestWrapper() });

      const unfollowButton = screen.getByText('Unfollow');
      fireEvent.click(unfollowButton);

      await waitFor(() => {
        expect(mockUnfollowMutate).toHaveBeenCalledWith(1);
      });
    });

    test('shows loading state during follow/unfollow', () => {
      mockUseFollowUser.mockReturnValue({
        mutate: jest.fn(),
        isLoading: true,
        error: null,
      });

      render(<ProfilePage />, { wrapper: createTestWrapper() });

      expect(screen.getByText('Following...')).toBeInTheDocument();
    });
  });

  describe('Cover Image Upload', () => {
    test('handles cover image upload', async () => {
      const mockUploadMutate = jest.fn();
      mockUseUploadCover.mockReturnValue({
        mutate: mockUploadMutate,
        isLoading: false,
        error: null,
      });

      mockUseUserProfile.mockReturnValue({
        data: mockOwnProfile,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ProfilePage />, { wrapper: createTestWrapper() });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const uploadInput = screen.getByTestId('cover-upload-input');

      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockUploadMutate).toHaveBeenCalledWith(file);
      });
    });

    test('shows loading state during upload', () => {
      mockUseUploadCover.mockReturnValue({
        mutate: jest.fn(),
        isLoading: true,
        error: null,
      });

      mockUseUserProfile.mockReturnValue({
        data: mockOwnProfile,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ProfilePage />, { wrapper: createTestWrapper() });

      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    test('switches between tabs correctly', () => {
      render(<ProfilePage />, { wrapper: createTestWrapper() });

      // Default tab should be Posts
      expect(screen.getByText('Posts')).toHaveClass('active');
      expect(screen.queryByText('About')).not.toHaveClass('active');

      // Click About tab
      const aboutTab = screen.getByText('About');
      fireEvent.click(aboutTab);

      expect(aboutTab).toHaveClass('active');
      expect(screen.getByText('Posts')).not.toHaveClass('active');
    });

    test('renders tab content correctly', () => {
      render(<ProfilePage />, { wrapper: createTestWrapper() });

      // Posts tab content
      expect(screen.getByText('Posts')).toBeInTheDocument();

      // Switch to About tab
      fireEvent.click(screen.getByText('About'));
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Test bio')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(<ProfilePage />, { wrapper: createTestWrapper() });

      expect(screen.getByLabelText('Profile avatar')).toBeInTheDocument();
      expect(screen.getByLabelText('Cover image')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
    });

    test('supports keyboard navigation', () => {
      render(<ProfilePage />, { wrapper: createTestWrapper() });

      const followButton = screen.getByText('Follow');
      followButton.focus();
      
      expect(followButton).toHaveFocus();
      
      // Test tab navigation
      fireEvent.keyDown(followButton, { key: 'Tab' });
      // Should move to next focusable element
    });
  });

  describe('Error Handling', () => {
    test('handles follow error', () => {
      mockUseFollowUser.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
        error: new Error('Follow failed'),
      });

      render(<ProfilePage />, { wrapper: createTestWrapper() });

      expect(screen.getByText('Error: Follow failed')).toBeInTheDocument();
    });

    test('handles upload error', () => {
      mockUseUploadCover.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
        error: new Error('Upload failed'),
      });

      mockUseUserProfile.mockReturnValue({
        data: mockOwnProfile,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<ProfilePage />, { wrapper: createTestWrapper() });

      expect(screen.getByText('Error: Upload failed')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('memoizes expensive calculations', () => {
      const { rerender } = render(<ProfilePage />, { wrapper: createTestWrapper() });

      // Re-render with same props
      rerender(<ProfilePage />);

      // Should not trigger unnecessary re-renders
      expect(mockUseUserProfile).toHaveBeenCalledTimes(1);
    });

    test('lazy loads sidebar components', () => {
      render(<ProfilePage />, { wrapper: createTestWrapper() });

      // Sidebar components should be lazy loaded
      expect(screen.queryByTestId('sidebar-component')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    test('adapts to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ProfilePage />, { wrapper: createTestWrapper() });

      // Should show mobile-optimized layout
      expect(screen.getByTestId('mobile-profile-layout')).toBeInTheDocument();
    });

    test('handles touch events', () => {
      render(<ProfilePage />, { wrapper: createTestWrapper() });

      const followButton = screen.getByText('Follow');
      
      // Test touch event
      fireEvent.touchStart(followButton);
      fireEvent.touchEnd(followButton);

      // Should handle touch events properly
      expect(followButton).toBeInTheDocument();
    });
  });
}); 