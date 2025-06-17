CREATE TABLE IF NOT EXISTS public.chat_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.chat_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view groups" 
  ON public.chat_groups 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can update their groups" 
  ON public.chat_groups 
  FOR UPDATE 
  USING (creator_id = auth.uid());

CREATE POLICY "Creators can delete their groups" 
  ON public.chat_groups 
  FOR DELETE 
  USING (creator_id = auth.uid());

CREATE POLICY "Users can create groups" 
  ON public.chat_groups 
  FOR INSERT 
  WITH CHECK (creator_id = auth.uid());
