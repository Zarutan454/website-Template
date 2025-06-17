
CREATE TABLE public.post_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Add Row Level Security
ALTER TABLE public.post_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to manage their own subscriptions
CREATE POLICY "Users can manage their own subscriptions" 
  ON public.post_subscriptions 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_post_subscriptions_updated_at
  BEFORE UPDATE ON public.post_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_post_subscriptions_user_id ON public.post_subscriptions(user_id);
CREATE INDEX idx_post_subscriptions_post_id ON public.post_subscriptions(post_id);
CREATE INDEX idx_post_subscriptions_active ON public.post_subscriptions(active);
