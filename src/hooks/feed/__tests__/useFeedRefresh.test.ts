
import { renderHook, act } from '@testing-library/react';
import { useFeedRefresh } from '../useFeedRefresh';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('useFeedRefresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct default values', () => {
    const fetchPosts = jest.fn().mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useFeedRefresh({
      fetchPosts,
      feedType: 'recent',
      isAuthenticated: true,
      enableAutoRefresh: true,
      refreshInterval: 120000
    }));
    
    expect(result.current.hasNewPosts).toBe(false);
    expect(result.current.lastRefresh).toBeInstanceOf(Date);
  });

  it('should not auto-refresh when enableAutoRefresh is false', () => {
    const fetchPosts = jest.fn().mockResolvedValue(undefined);
    
    renderHook(() => useFeedRefresh({
      fetchPosts,
      feedType: 'recent',
      isAuthenticated: true,
      enableAutoRefresh: false,
      refreshInterval: 120000
    }));
    
    act(() => {
      jest.advanceTimersByTime(130000);
    });
    
    expect(fetchPosts).not.toHaveBeenCalled();
  });

  it('should auto-refresh when timer elapses and user is authenticated', async () => {
    const fetchPosts = jest.fn().mockResolvedValue(undefined);
    
    renderHook(() => useFeedRefresh({
      fetchPosts,
      feedType: 'recent',
      isAuthenticated: true,
      enableAutoRefresh: true,
      refreshInterval: 120000
    }));
    
    await act(async () => {
      jest.advanceTimersByTime(130000);
    });
    
    expect(fetchPosts).toHaveBeenCalledWith('recent');
  });

  it('should not auto-refresh when user is not authenticated', () => {
    const fetchPosts = jest.fn().mockResolvedValue(undefined);
    
    renderHook(() => useFeedRefresh({
      fetchPosts,
      feedType: 'recent',
      isAuthenticated: false,
      enableAutoRefresh: true,
      refreshInterval: 120000
    }));
    
    act(() => {
      jest.advanceTimersByTime(130000);
    });
    
    expect(fetchPosts).not.toHaveBeenCalled();
  });

  it('should handle manual refresh correctly', async () => {
    const fetchPosts = jest.fn().mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useFeedRefresh({
      fetchPosts,
      feedType: 'recent',
      isAuthenticated: true,
      enableAutoRefresh: true,
      refreshInterval: 120000
    }));
    
    const initialLastRefresh = result.current.lastRefresh;
    
    await act(async () => {
      await result.current.refreshFeed();
    });
    
    expect(fetchPosts).toHaveBeenCalledWith('recent');
    expect(toast.info).toHaveBeenCalledWith("Feed wird aktualisiert...");
    expect(toast.success).toHaveBeenCalledWith("Feed aktualisiert");
    expect(result.current.hasNewPosts).toBe(false);
    // Should have updated the lastRefresh time
    expect(result.current.lastRefresh).not.toBe(initialLastRefresh);
  });

  it('should show error toast when manual refresh fails', async () => {
    const fetchPosts = jest.fn().mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useFeedRefresh({
      fetchPosts,
      feedType: 'recent',
      isAuthenticated: true,
      enableAutoRefresh: true,
      refreshInterval: 120000
    }));
    
    await act(async () => {
      await result.current.refreshFeed();
    });
    
    expect(fetchPosts).toHaveBeenCalledWith('recent');
    expect(toast.info).toHaveBeenCalledWith("Feed wird aktualisiert...");
    expect(toast.error).toHaveBeenCalledWith("Fehler beim Aktualisieren");
  });
});
