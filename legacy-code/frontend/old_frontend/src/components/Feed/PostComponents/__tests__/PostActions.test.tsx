
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PostActions from '../PostActions';

// Mock dependencies
jest.mock('@/hooks/useMining', () => ({
  useMining: () => ({
    recordActivity: jest.fn().mockResolvedValue(true),
    isMining: true
  })
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('PostActions', () => {
  const mockProps = {
    postId: '123',
    isLiked: false,
    onLike: jest.fn().mockResolvedValue(true),
    onToggleComments: jest.fn(),
    onShare: jest.fn().mockResolvedValue(true),
    showComments: false,
    showMiningRewards: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders like, comment and share buttons', () => {
    render(<PostActions {...mockProps} />);
    
    // Check for the presence of the three buttons
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('calls onLike when like button is clicked', async () => {
    render(<PostActions {...mockProps} />);
    
    const likeButton = screen.getAllByRole('button')[0];
    fireEvent.click(likeButton);
    
    await waitFor(() => {
      expect(mockProps.onLike).toHaveBeenCalledWith('123');
    });
  });

  it('calls onToggleComments when comment button is clicked', () => {
    render(<PostActions {...mockProps} />);
    
    const commentButton = screen.getAllByRole('button')[1];
    fireEvent.click(commentButton);
    
    expect(mockProps.onToggleComments).toHaveBeenCalled();
  });

  it('applies special styling to like button when post is liked', () => {
    render(<PostActions {...mockProps} isLiked={true} />);
    
    const likeButton = screen.getAllByRole('button')[0];
    expect(likeButton).toHaveClass('text-red-500');
  });

  it('applies special styling to comment button when comments are shown', () => {
    render(<PostActions {...mockProps} showComments={true} />);
    
    const commentButton = screen.getAllByRole('button')[1];
    const icon = commentButton.querySelector('.text-primary');
    expect(icon).toBeInTheDocument();
  });
});
