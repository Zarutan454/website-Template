
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePost } from '@/hooks/usePost';
import { toast } from 'sonner';

// Mock der Abhängigkeiten
vi.mock('@/lib/supabase', () => {
  const supabaseMock = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null })
  };
  
  return { supabase: supabaseMock };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

import { supabase } from '@/lib/supabase';

describe('usePost Hook', () => {
  const mockPostId = 'test-post-id';
  const mockUserId = 'test-user-id';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Grundfunktionen', () => {
    it('sollte Standardzustände zurückgeben', () => {
      const { result } = renderHook(() => usePost(mockPostId, mockUserId));
      
      expect(result.current.liked).toBe(false);
      expect(result.current.bookmarked).toBe(false);
      expect(result.current.showComments).toBe(false);
      expect(result.current.commentText).toBe('');
      expect(result.current.isSubmittingComment).toBe(false);
      expect(result.current.isEditing).toBe(false);
      expect(result.current.editedContent).toBe('');
      expect(result.current.isDeleting).toBe(false);
      expect(result.current.isReporting).toBe(false);
      expect(result.current.reportReason).toBe('');
    });
  });

  describe('Like Funktionalität', () => {
    it('sollte einen Post liken, wenn er nicht geliked ist', async () => {
      (supabase.from().insert as any).mockResolvedValueOnce({ error: null });
      (supabase.rpc as any).mockResolvedValueOnce({ error: null });
      
      const onLikeMock = vi.fn();
      
      const { result } = renderHook(() => 
        usePost(mockPostId, mockUserId, onLikeMock)
      );
      
      await act(async () => {
        await result.current.handleLike();
      });
      
      expect(supabase.from).toHaveBeenCalledWith('likes');
      expect(supabase.from().insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        post_id: mockPostId
      });
      expect(supabase.rpc).toHaveBeenCalledWith('increment_likes', { post_id: mockPostId });
      expect(result.current.liked).toBe(true);
      expect(onLikeMock).toHaveBeenCalled();
    });
    
    it('sollte einen Like entfernen, wenn der Post bereits geliked wurde', async () => {
      (supabase.from().delete as any).mockResolvedValueOnce({ error: null });
      (supabase.rpc as any).mockResolvedValueOnce({ error: null });
      
      const { result } = renderHook(() => usePost(mockPostId, mockUserId));
      
      // Manuelles Setzen des liked-Status auf true für den Test
      result.current.setLiked(true);
      
      await act(async () => {
        await result.current.handleLike();
      });
      
      expect(supabase.from).toHaveBeenCalledWith('likes');
      expect(supabase.from().delete).toHaveBeenCalled();
      expect(supabase.rpc).toHaveBeenCalledWith('decrement_likes', { post_id: mockPostId });
      expect(result.current.liked).toBe(false);
    });
    
    it('sollte einen Fehler anzeigen, wenn das Liken fehlschlägt', async () => {
      (supabase.from().insert as any).mockResolvedValueOnce({ 
        error: { message: 'Fehler beim Liken' } 
      });
      
      const { result } = renderHook(() => usePost(mockPostId, mockUserId));
      
      await act(async () => {
        await result.current.handleLike();
      });
      
      expect(toast.error).toHaveBeenCalledWith('Fehler beim Liken/Unliken des Beitrags');
      expect(result.current.liked).toBe(false);
    });
  });

  describe('Lesezeichen Funktionalität', () => {
    it('sollte einen Post als Lesezeichen hinzufügen', async () => {
      (supabase.from().insert as any).mockResolvedValueOnce({ error: null });
      
      const { result } = renderHook(() => usePost(mockPostId, mockUserId));
      
      await act(async () => {
        await result.current.handleBookmark();
      });
      
      expect(supabase.from).toHaveBeenCalledWith('bookmarks');
      expect(supabase.from().insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        post_id: mockPostId
      });
      expect(toast.success).toHaveBeenCalledWith('Zu Lesezeichen hinzugefügt');
      expect(result.current.bookmarked).toBe(true);
    });
    
    it('sollte ein Lesezeichen entfernen', async () => {
      (supabase.from().delete as any).mockResolvedValueOnce({ error: null });
      
      const { result } = renderHook(() => usePost(mockPostId, mockUserId));
      
      // Manuelles Setzen des bookmarked-Status auf true für den Test
      result.current.setBookmarked(true);
      
      await act(async () => {
        await result.current.handleBookmark();
      });
      
      expect(supabase.from).toHaveBeenCalledWith('bookmarks');
      expect(supabase.from().delete).toHaveBeenCalled();
      expect(toast.info).toHaveBeenCalledWith('Lesezeichen entfernt');
      expect(result.current.bookmarked).toBe(false);
    });
  });

  describe('Kommentar Funktionalität', () => {
    it('sollte einen Kommentar erstellen', async () => {
      (supabase.from().insert as any).mockResolvedValueOnce({ error: null });
      (supabase.rpc as any).mockResolvedValueOnce({ error: null });
      
      const onCommentMock = vi.fn();
      
      const { result } = renderHook(() => 
        usePost(mockPostId, mockUserId, undefined, onCommentMock)
      );
      
      // Setzen des Kommentartexts
      act(() => {
        result.current.setCommentText('Testkommentar');
      });
      
      const mockEvent = {
        preventDefault: vi.fn()
      } as unknown as React.FormEvent;
      
      await act(async () => {
        await result.current.handleComment(mockEvent);
      });
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('comments');
      expect(supabase.from().insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        post_id: mockPostId,
        content: 'Testkommentar'
      });
      expect(supabase.rpc).toHaveBeenCalledWith('increment_comments', { post_id: mockPostId });
      expect(result.current.commentText).toBe('');
      expect(toast.success).toHaveBeenCalledWith('Kommentar hinzugefügt');
      expect(onCommentMock).toHaveBeenCalled();
    });
    
    it('sollte keinen leeren Kommentar erstellen', async () => {
      const mockEvent = {
        preventDefault: vi.fn()
      } as unknown as React.FormEvent;
      
      const { result } = renderHook(() => usePost(mockPostId, mockUserId));
      
      await act(async () => {
        await result.current.handleComment(mockEvent);
      });
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('Bearbeiten Funktionalität', () => {
    it('sollte einen Post aktualisieren', async () => {
      (supabase.from().update as any).mockResolvedValueOnce({ error: null });
      
      const { result } = renderHook(() => usePost(mockPostId, mockUserId));
      
      await act(async () => {
        await result.current.handleEdit('Aktualisierter Inhalt');
      });
      
      expect(supabase.from).toHaveBeenCalledWith('posts');
      expect(supabase.from().update).toHaveBeenCalledWith(expect.objectContaining({
        content: 'Aktualisierter Inhalt'
      }));
      expect(toast.success).toHaveBeenCalledWith('Beitrag aktualisiert');
    });
  });

  describe('Löschen Funktionalität', () => {
    it('sollte einen Post löschen', async () => {
      (supabase.from().delete as any).mockResolvedValueOnce({ error: null });
      
      const { result } = renderHook(() => usePost(mockPostId, mockUserId));
      
      await act(async () => {
        await result.current.handleDelete();
      });
      
      expect(supabase.from).toHaveBeenCalledWith('posts');
      expect(supabase.from().delete).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Beitrag gelöscht');
    });
  });

  describe('Teilen Funktionalität', () => {
    it('sollte die Share-Callback-Funktion aufrufen', () => {
      const onShareMock = vi.fn();
      
      const { result } = renderHook(() => 
        usePost(mockPostId, mockUserId, undefined, undefined, onShareMock)
      );
      
      act(() => {
        result.current.handleShare();
      });
      
      expect(onShareMock).toHaveBeenCalled();
    });
  });

  describe('Link kopieren Funktionalität', () => {
    const originalClipboard = { ...global.navigator.clipboard };
    
    beforeEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined)
        },
        writable: true
      });
    });
    
    afterEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true
      });
    });
    
    it('sollte den Post-Link in die Zwischenablage kopieren', () => {
      const { result } = renderHook(() => usePost(mockPostId, mockUserId));
      
      act(() => {
        result.current.handleCopyLink();
      });
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        `https://blockchain-social.network/post/${mockPostId}`
      );
      expect(toast.success).toHaveBeenCalledWith('Link in die Zwischenablage kopiert');
    });
  });
});
