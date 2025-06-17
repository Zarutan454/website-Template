CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.chat_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view members" 
  ON public.group_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can insert members" 
  ON public.group_members 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = group_id AND user_id = auth.uid() AND role = 'admin'
    ) OR 
    EXISTS (
      SELECT 1 FROM public.chat_groups 
      WHERE id = group_id AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can update members" 
  ON public.group_members 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = group_id AND user_id = auth.uid() AND role = 'admin'
    ) OR 
    EXISTS (
      SELECT 1 FROM public.chat_groups 
      WHERE id = group_id AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can delete members" 
  ON public.group_members 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = group_id AND user_id = auth.uid() AND role = 'admin'
    ) OR 
    EXISTS (
      SELECT 1 FROM public.chat_groups 
      WHERE id = group_id AND creator_id = auth.uid()
    )
  );

ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.chat_groups(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_messages_group_id ON public.messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
