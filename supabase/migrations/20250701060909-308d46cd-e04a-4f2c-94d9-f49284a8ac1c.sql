
-- Create a profiles table to store additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'username'
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update liked_songs table to use user_id instead of session
ALTER TABLE public.liked_songs 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create new RLS policies for liked_songs with user authentication
DROP POLICY IF EXISTS "Anyone can view liked songs" ON public.liked_songs;
DROP POLICY IF EXISTS "Anyone can manage liked songs" ON public.liked_songs;

CREATE POLICY "Users can view their own liked songs" 
  ON public.liked_songs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own liked songs" 
  ON public.liked_songs 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Create policies for playlists
CREATE POLICY "Users can view their own playlists" 
  ON public.playlists 
  FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage their own playlists" 
  ON public.playlists 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create playlist_tracks table for many-to-many relationship
CREATE TABLE public.playlist_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  track_order INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, track_id)
);

-- Enable RLS for playlist_tracks
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Create policies for playlist_tracks (inherit from playlist permissions)
CREATE POLICY "Users can view tracks in accessible playlists" 
  ON public.playlist_tracks 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE id = playlist_id 
      AND (user_id = auth.uid() OR is_public = true)
    )
  );

CREATE POLICY "Users can manage tracks in their own playlists" 
  ON public.playlist_tracks 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE id = playlist_id 
      AND user_id = auth.uid()
    )
  );
