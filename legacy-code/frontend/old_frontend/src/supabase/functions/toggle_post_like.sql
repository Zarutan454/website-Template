
-- Diese Funktion führt das Liken/Unliken eines Posts in einer Transaktion durch
-- um Race-Conditions zu vermeiden und Datenintegrität zu gewährleisten
CREATE OR REPLACE FUNCTION public.toggle_post_like(
  p_user_id UUID,
  p_post_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_liked BOOLEAN;
  new_status JSONB;
  likes_count_value INTEGER;
BEGIN
  -- Überprüfe, ob der Post bereits geliked wurde
  SELECT EXISTS (
    SELECT 1 FROM public.likes
    WHERE user_id = p_user_id AND post_id = p_post_id
  ) INTO is_liked;
  
  -- Starte Transaktion
  BEGIN
    IF is_liked THEN
      -- Unlike: Like entfernen
      DELETE FROM public.likes
      WHERE user_id = p_user_id AND post_id = p_post_id;
      
      -- Likes-Zähler im Post dekrementieren
      UPDATE public.posts
      SET likes_count = GREATEST(0, likes_count - 1)
      WHERE id = p_post_id
      RETURNING likes_count INTO likes_count_value;
      
      new_status := jsonb_build_object(
        'action', 'unliked',
        'is_liked', false,
        'likes_count', likes_count_value
      );
    ELSE
      -- Like: Neuen Like hinzufügen
      INSERT INTO public.likes (user_id, post_id)
      VALUES (p_user_id, p_post_id);
      
      -- Likes-Zähler im Post inkrementieren
      UPDATE public.posts
      SET likes_count = COALESCE(likes_count, 0) + 1
      WHERE id = p_post_id
      RETURNING likes_count INTO likes_count_value;
      
      new_status := jsonb_build_object(
        'action', 'liked',
        'is_liked', true,
        'likes_count', likes_count_value
      );
    END IF;
    
    RETURN new_status;
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback bei Fehler und Fehlerdetails zurückgeben
      RETURN jsonb_build_object(
        'error', SQLERRM,
        'code', SQLSTATE,
        'success', false
      );
  END;
END;
$$;
