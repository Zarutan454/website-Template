
import React from 'react';
import { render, screen } from '@testing-library/react';
import PostContent from '../PostContent';

// Mock the YouTube util
jest.mock('@/utils/youtubeUtils', () => ({
  extractYoutubeVideoId: jest.fn((content) => {
    return content.includes('youtube.com') ? 'abc123' : null;
  })
}));

// Mock the YouTube embed component
jest.mock('../../YouTubeEmbed', () => ({
  __esModule: true,
  default: ({ videoId }) => <div data-testid="youtube-embed" data-video-id={videoId}>YouTube Embed</div>
}));

describe('PostContent', () => {
  it('renders the content text', () => {
    render(<PostContent content="This is a test post" />);
    expect(screen.getByText('This is a test post')).toBeInTheDocument();
  });

  it('renders an image when image_url is provided and no YouTube link is detected', () => {
    render(<PostContent 
      content="Post with image" 
      image_url="https://example.com/image.jpg" 
    />);
    
    const image = screen.getByAltText('Post Image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders a YouTube embed when content contains a YouTube link', () => {
    render(<PostContent 
      content="Check out this video: https://youtube.com/watch?v=abc123" 
      image_url="https://example.com/image.jpg"
    />);
    
    const youtubeEmbed = screen.getByTestId('youtube-embed');
    expect(youtubeEmbed).toBeInTheDocument();
    expect(youtubeEmbed).toHaveAttribute('data-video-id', 'abc123');
    
    // Should not render the image when YouTube video is present
    const image = screen.queryByAltText('Post Image');
    expect(image).not.toBeInTheDocument();
  });

  it('does not render an image or YouTube embed when neither is available', () => {
    render(<PostContent content="Just text" />);
    
    const image = screen.queryByAltText('Post Image');
    expect(image).not.toBeInTheDocument();
    
    const youtubeEmbed = screen.queryByTestId('youtube-embed');
    expect(youtubeEmbed).not.toBeInTheDocument();
  });
});
