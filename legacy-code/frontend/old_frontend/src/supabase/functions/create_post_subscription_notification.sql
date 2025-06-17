
-- Funktion zur Benachrichtigung von Abonnenten bei Postaktivitäten
CREATE OR REPLACE FUNCTION public.create_post_subscription_notification(
  p_post_id UUID,
  p_actor_id UUID,
  p_action_type TEXT,
  p_content TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  post_author_id UUID;
  subscription_rec RECORD;
BEGIN
  -- Autor des Posts ermitteln
  SELECT author_id INTO post_author_id
  FROM posts
  WHERE id = p_post_id;
  
  -- Benachrichtigung für den Autor, wenn er nicht selbst die Aktion ausgeführt hat
  IF post_author_id IS NOT NULL AND post_author_id != p_actor_id THEN
    PERFORM create_notification(
      post_author_id,
      p_action_type,
      p_content,
      p_actor_id,
      p_post_id,
      'post'
    );
  END IF;
  
  -- Benachrichtigungen für alle aktiven Abonnenten des Posts
  FOR subscription_rec IN
    SELECT user_id
    FROM post_subscriptions
    WHERE post_id = p_post_id
    AND active = true
    AND user_id != post_author_id -- Autor nicht doppelt benachrichtigen
    AND user_id != p_actor_id -- Aktor nicht benachrichtigen
  LOOP
    -- Typ ändern für Benachrichtigungen an Abonnenten
    PERFORM create_notification(
      subscription_rec.user_id,
      'post_activity',
      p_content,
      p_actor_id,
      p_post_id,
      'post'
    );
  END LOOP;
END;
$$;
