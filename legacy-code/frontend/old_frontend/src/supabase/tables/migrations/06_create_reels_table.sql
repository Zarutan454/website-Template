CREATE TABLE IF NOT EXISTS public.reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  tags TEXT[],
  duration INTEGER, -- in seconds
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reels are viewable by everyone" 
  ON public.reels FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own reels" 
  ON public.reels FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reels" 
  ON public.reels FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reels" 
  ON public.reels FOR DELETE 
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS reels_user_id_idx ON public.reels(user_id);
CREATE INDEX IF NOT EXISTS reels_created_at_idx ON public.reels(created_at);
