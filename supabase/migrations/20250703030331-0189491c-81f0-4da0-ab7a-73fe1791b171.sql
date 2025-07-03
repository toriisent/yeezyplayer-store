
-- Add additional profile fields for customization
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS background_image_url TEXT;

-- Allow users to view other profiles (for seeing liked songs)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Anyone can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Keep the update policy restricted to own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow users to view other users' liked songs (make them public)
DROP POLICY IF EXISTS "Users can view their own liked songs" ON public.liked_songs;
CREATE POLICY "Anyone can view liked songs" 
  ON public.liked_songs 
  FOR SELECT 
  USING (true);

-- Keep insert/delete policies restricted to own liked songs
CREATE POLICY "Users can insert their own liked songs" 
  ON public.liked_songs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liked songs" 
  ON public.liked_songs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to profile images
CREATE POLICY "Anyone can view profile images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload their own profile images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
