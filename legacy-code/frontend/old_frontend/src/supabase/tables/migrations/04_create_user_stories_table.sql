CREATE TABLE IF NOT EXISTS public.user_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  media_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'text')),
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT user_stories_expires_check CHECK (expires_at > created_at)
);

ALTER TABLE public.user_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stories are viewable by everyone" 
  ON public.user_stories FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own stories" 
  ON public.user_stories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" 
  ON public.user_stories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" 
  ON public.user_stories FOR DELETE 
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS user_stories_user_id_idx ON public.user_stories(user_id);
CREATE INDEX IF NOT EXISTS user_stories_expires_at_idx ON public.user_stories(expires_at);
