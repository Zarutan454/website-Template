CREATE TABLE IF NOT EXISTS public.reel_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reel_id UUID NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (reel_id, user_id)
);

ALTER TABLE public.reel_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone" 
  ON public.reel_likes FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own likes" 
  ON public.reel_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
  ON public.reel_likes FOR DELETE 
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.reel_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reel_id UUID NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.reel_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" 
  ON public.reel_comments FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own comments" 
  ON public.reel_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON public.reel_comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.reel_comments FOR DELETE 
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS reel_likes_reel_id_idx ON public.reel_likes(reel_id);
CREATE INDEX IF NOT EXISTS reel_likes_user_id_idx ON public.reel_likes(user_id);
CREATE INDEX IF NOT EXISTS reel_comments_reel_id_idx ON public.reel_comments(reel_id);
CREATE INDEX IF NOT EXISTS reel_comments_user_id_idx ON public.reel_comments(user_id);

CREATE OR REPLACE FUNCTION update_reels_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reels SET likes = likes + 1 WHERE id = NEW.reel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reels SET likes = likes - 1 WHERE id = OLD.reel_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reels_likes_count_trigger
AFTER INSERT OR DELETE ON public.reel_likes
FOR EACH ROW
EXECUTE FUNCTION update_reels_likes_count();

CREATE OR REPLACE FUNCTION update_reels_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reels SET comments_count = comments_count + 1 WHERE id = NEW.reel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reels SET comments_count = comments_count - 1 WHERE id = OLD.reel_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reels_comments_count_trigger
AFTER INSERT OR DELETE ON public.reel_comments
FOR EACH ROW
EXECUTE FUNCTION update_reels_comments_count();
