
-- Create releases table
CREATE TABLE public.releases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single', 'ep', 'album')),
  cover_url TEXT NOT NULL,
  release_date DATE NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tracks table
CREATE TABLE public.tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id UUID NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  audio_url TEXT NOT NULL DEFAULT '',
  cover_url TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 180,
  track_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lyrics table for word-by-word timing
CREATE TABLE public.lyrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  line_time DECIMAL NOT NULL,
  line_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lyric_words table for individual word timing
CREATE TABLE public.lyric_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lyric_id UUID NOT NULL REFERENCES public.lyrics(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  start_time DECIMAL NOT NULL,
  end_time DECIMAL NOT NULL,
  word_order INTEGER NOT NULL
);

-- Create liked_songs table to track user preferences
CREATE TABLE public.liked_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_session TEXT NOT NULL, -- Using session ID instead of user auth for simplicity
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(track_id, user_session)
);

-- Enable Row Level Security (but make data publicly readable for music sharing)
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyric_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (everyone can see the music)
CREATE POLICY "Anyone can view releases" ON public.releases FOR SELECT USING (true);
CREATE POLICY "Anyone can view tracks" ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Anyone can view lyrics" ON public.lyrics FOR SELECT USING (true);
CREATE POLICY "Anyone can view lyric words" ON public.lyric_words FOR SELECT USING (true);
CREATE POLICY "Anyone can view liked songs" ON public.liked_songs FOR SELECT USING (true);

-- Create policies for insert/update/delete (for admin features later)
CREATE POLICY "Anyone can manage releases" ON public.releases FOR ALL USING (true);
CREATE POLICY "Anyone can manage tracks" ON public.tracks FOR ALL USING (true);
CREATE POLICY "Anyone can manage lyrics" ON public.lyrics FOR ALL USING (true);
CREATE POLICY "Anyone can manage lyric words" ON public.lyric_words FOR ALL USING (true);
CREATE POLICY "Anyone can manage liked songs" ON public.liked_songs FOR ALL USING (true);

-- Insert sample data (migrating from your existing data)
INSERT INTO public.releases (id, title, type, cover_url, release_date, is_featured) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'The Life of Pablo', 'album', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', '2016-02-14', true),
('550e8400-e29b-41d4-a716-446655440002', 'Donda', 'album', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=400&fit=crop', '2021-08-29', true);

INSERT INTO public.tracks (id, release_id, title, artist, audio_url, cover_url, duration, track_order) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Ultralight Beam', 'Kanye West', '', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', 324, 1),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Father Stretch My Hands Pt. 1', 'Kanye West', '', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', 256, 2),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', 'Donda Chant', 'Kanye West', '', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=400&fit=crop', 52, 1);
