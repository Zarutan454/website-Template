
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  likePost, 
  unlikePost, 
  bookmarkPost, 
  unbookmarkPost, 
  createComment,
  updatePost,
  deletePost
} from '@/lib/database';

// Mock der Supabase-Instanz
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null })
  }
}));

import { supabase } from '@/lib/supabase';

describe('Database Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('likePost', () => {
    it('sollte einen Post liken und den Like-Zähler erhöhen', async () => {
      // Mock-Antwort für das Einfügen eines Like
      (supabase.from().insert as any).mockResolvedValueOnce({
        data: { id: 'like-id', user_id: 'user-123', post_id: 'post-456' },
        error: null
      });
      
      const result = await likePost('user-123', 'post-456');
      
      expect(supabase.from).toHaveBeenCalledWith('likes');
      expect(supabase.from().insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        post_id: 'post-456'
      });
      
      expect(supabase.rpc).toHaveBeenCalledWith('increment_likes', { post_id: 'post-456' });
      
      expect(result).toEqual({
        data: { id: 'like-id', user_id: 'user-123', post_id: 'post-456' },
        error: null
      });
    });
    
    it('sollte den Like-Zähler nicht erhöhen, wenn ein Fehler auftritt', async () => {
      // Mock-Antwort für einen Fehler beim Einfügen
      (supabase.from().insert as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'Datenbankfehler' }
      });
      
      const result = await likePost('user-123', 'post-456');
      
      expect(supabase.from).toHaveBeenCalledWith('likes');
      expect(supabase.from().insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        post_id: 'post-456'
      });
      
      // rpc sollte nicht aufgerufen werden, wenn ein Fehler auftritt
      expect(supabase.rpc).not.toHaveBeenCalled();
      
      expect(result).toEqual({
        data: null,
        error: { message: 'Datenbankfehler' }
      });
    });
  });

  describe('unlikePost', () => {
    it('sollte einen Like entfernen und den Like-Zähler verringern', async () => {
      // Mock-Antwort für das Löschen eines Like
      (supabase.from().delete().eq().eq as any).mockResolvedValueOnce({
        data: { id: 'like-id', user_id: 'user-123', post_id: 'post-456' },
        error: null
      });
      
      const result = await unlikePost('user-123', 'post-456');
      
      expect(supabase.from).toHaveBeenCalledWith('likes');
      expect(supabase.from().delete).toHaveBeenCalled();
      expect(supabase.from().delete().eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(supabase.from().delete().eq().eq).toHaveBeenCalledWith('post_id', 'post-456');
      
      expect(supabase.rpc).toHaveBeenCalledWith('decrement_likes', { post_id: 'post-456' });
      
      expect(result).toEqual({
        data: { id: 'like-id', user_id: 'user-123', post_id: 'post-456' },
        error: null
      });
    });
  });

  describe('bookmarkPost', () => {
    it('sollte einen Post als Lesezeichen hinzufügen', async () => {
      // Mock-Antwort für das Hinzufügen eines Lesezeichens
      (supabase.from().insert as any).mockResolvedValueOnce({
        data: { id: 'bookmark-id', user_id: 'user-123', post_id: 'post-456' },
        error: null
      });
      
      const result = await bookmarkPost('user-123', 'post-456');
      
      expect(supabase.from).toHaveBeenCalledWith('bookmarks');
      expect(supabase.from().insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        post_id: 'post-456'
      });
      
      expect(result).toEqual({
        data: { id: 'bookmark-id', user_id: 'user-123', post_id: 'post-456' },
        error: null
      });
    });
  });

  describe('unbookmarkPost', () => {
    it('sollte ein Lesezeichen entfernen', async () => {
      // Mock-Antwort für das Entfernen eines Lesezeichens
      (supabase.from().delete().eq().eq as any).mockResolvedValueOnce({
        data: { id: 'bookmark-id', user_id: 'user-123', post_id: 'post-456' },
        error: null
      });
      
      const result = await unbookmarkPost('user-123', 'post-456');
      
      expect(supabase.from).toHaveBeenCalledWith('bookmarks');
      expect(supabase.from().delete).toHaveBeenCalled();
      expect(supabase.from().delete().eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(supabase.from().delete().eq().eq).toHaveBeenCalledWith('post_id', 'post-456');
      
      expect(result).toEqual({
        data: { id: 'bookmark-id', user_id: 'user-123', post_id: 'post-456' },
        error: null
      });
    });
  });

  describe('createComment', () => {
    it('sollte einen Kommentar erstellen und den Kommentar-Zähler erhöhen', async () => {
      // Mock-Antwort für das Erstellen eines Kommentars
      (supabase.from().insert as any).mockResolvedValueOnce({
        data: { id: 'comment-id', user_id: 'user-123', post_id: 'post-456', content: 'Testkommentar' },
        error: null
      });
      
      const result = await createComment('user-123', 'post-456', 'Testkommentar');
      
      expect(supabase.from).toHaveBeenCalledWith('comments');
      expect(supabase.from().insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        post_id: 'post-456',
        content: 'Testkommentar'
      });
      
      expect(supabase.rpc).toHaveBeenCalledWith('increment_comments', { post_id: 'post-456' });
      
      expect(result).toEqual({
        data: { id: 'comment-id', user_id: 'user-123', post_id: 'post-456', content: 'Testkommentar' },
        error: null
      });
    });
  });

  describe('updatePost', () => {
    it('sollte einen Post aktualisieren', async () => {
      const nowISOString = new Date().toISOString();
      const dateNowSpy = vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(nowISOString);
      
      // Mock-Antwort für das Aktualisieren eines Posts
      (supabase.from().update().eq().eq as any).mockResolvedValueOnce({
        data: { id: 'post-456', author_id: 'user-123', content: 'Aktualisierter Content', updated_at: nowISOString },
        error: null
      });
      
      const result = await updatePost('user-123', 'post-456', { content: 'Aktualisierter Content' });
      
      expect(supabase.from).toHaveBeenCalledWith('posts');
      expect(supabase.from().update).toHaveBeenCalledWith({
        content: 'Aktualisierter Content',
        updated_at: nowISOString
      });
      expect(supabase.from().update().eq).toHaveBeenCalledWith('id', 'post-456');
      expect(supabase.from().update().eq().eq).toHaveBeenCalledWith('author_id', 'user-123');
      
      expect(result).toEqual({
        data: { id: 'post-456', author_id: 'user-123', content: 'Aktualisierter Content', updated_at: nowISOString },
        error: null
      });
      
      dateNowSpy.mockRestore();
    });
  });

  describe('deletePost', () => {
    it('sollte einen Post löschen', async () => {
      // Mock-Antwort für das Löschen eines Posts
      (supabase.from().delete().eq().eq as any).mockResolvedValueOnce({
        data: { id: 'post-456', author_id: 'user-123' },
        error: null
      });
      
      const result = await deletePost('user-123', 'post-456');
      
      expect(supabase.from).toHaveBeenCalledWith('posts');
      expect(supabase.from().delete).toHaveBeenCalled();
      expect(supabase.from().delete().eq).toHaveBeenCalledWith('id', 'post-456');
      expect(supabase.from().delete().eq().eq).toHaveBeenCalledWith('author_id', 'user-123');
      
      expect(result).toEqual({
        data: { id: 'post-456', author_id: 'user-123' },
        error: null
      });
    });
  });
});
