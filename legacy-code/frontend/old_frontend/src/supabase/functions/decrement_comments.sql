
CREATE OR REPLACE FUNCTION public.decrement_comments(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = GREATEST(0, COALESCE(comments_count, 0) - 1),
      updated_at = now()
  WHERE id = post_id;
END;
$$;
