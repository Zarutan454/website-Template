CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES public.user_stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (story_id, viewer_id)
);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Story owners can see who viewed their stories" 
  ON public.story_views FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_stories 
      WHERE id = story_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own views" 
  ON public.story_views FOR INSERT 
  WITH CHECK (auth.uid() = viewer_id);

CREATE INDEX IF NOT EXISTS story_views_story_id_idx ON public.story_views(story_id);
CREATE INDEX IF NOT EXISTS story_views_viewer_id_idx ON public.story_views(viewer_id);
