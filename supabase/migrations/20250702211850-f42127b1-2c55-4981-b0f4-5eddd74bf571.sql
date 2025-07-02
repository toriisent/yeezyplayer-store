
-- Update the liked_songs table to ensure proper user association
-- First, make sure the user_id column is properly set up
ALTER TABLE public.liked_songs 
ALTER COLUMN user_id SET NOT NULL;

-- Update the RLS policies to be more specific
DROP POLICY IF EXISTS "Users can view their own liked songs" ON public.liked_songs;
DROP POLICY IF EXISTS "Users can manage their own liked songs" ON public.liked_songs;

-- Create updated policies for better security
CREATE POLICY "Users can view their own liked songs" 
  ON public.liked_songs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own liked songs" 
  ON public.liked_songs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liked songs" 
  ON public.liked_songs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add an index for better performance on user queries
CREATE INDEX IF NOT EXISTS idx_liked_songs_user_id ON public.liked_songs(user_id);
CREATE INDEX IF NOT EXISTS idx_liked_songs_user_track ON public.liked_songs(user_id, track_id);
