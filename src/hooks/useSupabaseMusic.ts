
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Release, Track, LyricLine } from '../contexts/MusicContext';

export const useSupabaseMusic = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate a unique session ID for tracking likes
  const getSessionId = () => {
    let sessionId = localStorage.getItem('kanye-player-session');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('kanye-player-session', sessionId);
    }
    return sessionId;
  };

  const fetchReleases = async () => {
    try {
      console.log('Fetching releases from Supabase...');
      
      // Fetch releases with their tracks
      const { data: releasesData, error: releasesError } = await supabase
        .from('releases')
        .select(`
          *,
          tracks (
            *,
            lyrics (
              *,
              lyric_words (*)
            )
          )
        `)
        .order('release_date', { ascending: false });

      if (releasesError) {
        console.error('Error fetching releases:', releasesError);
        return;
      }

      console.log('Raw releases data:', releasesData);

      // Transform the data to match our Release interface
      const transformedReleases: Release[] = releasesData?.map((release: any) => {
        const tracks: Track[] = release.tracks
          ?.sort((a: any, b: any) => a.track_order - b.track_order)
          .map((track: any) => {
            // Transform lyrics if they exist
            let lyrics: LyricLine[] = [];
            if (track.lyrics && track.lyrics.length > 0) {
              lyrics = track.lyrics
                .sort((a: any, b: any) => a.line_order - b.line_order)
                .map((lyricLine: any) => ({
                  time: parseFloat(lyricLine.line_time),
                  words: lyricLine.lyric_words
                    ?.sort((a: any, b: any) => a.word_order - b.word_order)
                    .map((word: any) => ({
                      word: word.word,
                      start: parseFloat(word.start_time),
                      end: parseFloat(word.end_time)
                    })) || []
                }));
            }

            return {
              id: track.id,
              title: track.title,
              artist: track.artist,
              audioUrl: track.audio_url,
              coverUrl: track.cover_url,
              duration: track.duration,
              lyrics
            };
          }) || [];

        return {
          id: release.id,
          title: release.title,
          type: release.type as 'single' | 'ep' | 'album',
          coverUrl: release.cover_url,
          releaseDate: release.release_date,
          isFeatured: release.is_featured,
          tracks
        };
      }) || [];

      console.log('Transformed releases:', transformedReleases);
      setReleases(transformedReleases);
    } catch (error) {
      console.error('Error in fetchReleases:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRelease = async (release: Omit<Release, 'id'>) => {
    try {
      // Insert release
      const { data: releaseData, error: releaseError } = await supabase
        .from('releases')
        .insert({
          title: release.title,
          type: release.type,
          cover_url: release.coverUrl,
          release_date: release.releaseDate,
          is_featured: release.isFeatured
        })
        .select()
        .single();

      if (releaseError) throw releaseError;

      // Insert tracks
      if (release.tracks && release.tracks.length > 0) {
        const tracksToInsert = release.tracks.map((track, index) => ({
          release_id: releaseData.id,
          title: track.title,
          artist: track.artist,
          audio_url: track.audioUrl || '',
          cover_url: track.coverUrl,
          duration: track.duration,
          track_order: index + 1
        }));

        const { error: tracksError } = await supabase
          .from('tracks')
          .insert(tracksToInsert);

        if (tracksError) throw tracksError;
      }

      await fetchReleases();
    } catch (error) {
      console.error('Error adding release:', error);
    }
  };

  const updateRelease = async (release: Release) => {
    try {
      const { error } = await supabase
        .from('releases')
        .update({
          title: release.title,
          type: release.type,
          cover_url: release.coverUrl,
          release_date: release.releaseDate,
          is_featured: release.isFeatured,
          updated_at: new Date().toISOString()
        })
        .eq('id', release.id);

      if (error) throw error;
      await fetchReleases();
    } catch (error) {
      console.error('Error updating release:', error);
    }
  };

  const deleteRelease = async (releaseId: string) => {
    try {
      const { error } = await supabase
        .from('releases')
        .delete()
        .eq('id', releaseId);

      if (error) throw error;
      await fetchReleases();
    } catch (error) {
      console.error('Error deleting release:', error);
    }
  };

  const toggleFeatured = async (releaseId: string) => {
    try {
      const release = releases.find(r => r.id === releaseId);
      if (!release) return;

      const { error } = await supabase
        .from('releases')
        .update({
          is_featured: !release.isFeatured,
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseId);

      if (error) throw error;
      await fetchReleases();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const updateTrackLyrics = async (trackId: string, lyrics: LyricLine[]) => {
    try {
      // First, delete existing lyrics for this track
      const { error: deleteError } = await supabase
        .from('lyrics')
        .delete()
        .eq('track_id', trackId);

      if (deleteError) throw deleteError;

      // Insert new lyrics
      if (lyrics.length > 0) {
        const lyricsToInsert = lyrics.map((line, lineIndex) => ({
          track_id: trackId,
          line_time: line.time,
          line_order: lineIndex
        }));

        const { data: insertedLyrics, error: lyricsError } = await supabase
          .from('lyrics')
          .insert(lyricsToInsert)
          .select();

        if (lyricsError) throw lyricsError;

        // Insert lyric words
        const wordsToInsert: any[] = [];
        lyrics.forEach((line, lineIndex) => {
          const lyricId = insertedLyrics[lineIndex].id;
          line.words.forEach((word, wordIndex) => {
            wordsToInsert.push({
              lyric_id: lyricId,
              word: word.word,
              start_time: word.start,
              end_time: word.end,
              word_order: wordIndex
            });
          });
        });

        if (wordsToInsert.length > 0) {
          const { error: wordsError } = await supabase
            .from('lyric_words')
            .insert(wordsToInsert);

          if (wordsError) throw wordsError;
        }
      }

      await fetchReleases();
    } catch (error) {
      console.error('Error updating track lyrics:', error);
    }
  };

  const getLikedSongs = async (): Promise<string[]> => {
    try {
      const sessionId = getSessionId();
      const { data, error } = await supabase
        .from('liked_songs')
        .select('track_id')
        .eq('user_session', sessionId);

      if (error) throw error;
      return data?.map(item => item.track_id) || [];
    } catch (error) {
      console.error('Error getting liked songs:', error);
      return [];
    }
  };

  const toggleLike = async (trackId: string) => {
    try {
      const sessionId = getSessionId();
      
      // Check if already liked
      const { data: existing } = await supabase
        .from('liked_songs')
        .select('id')
        .eq('track_id', trackId)
        .eq('user_session', sessionId)
        .single();

      if (existing) {
        // Unlike
        const { error } = await supabase
          .from('liked_songs')
          .delete()
          .eq('track_id', trackId)
          .eq('user_session', sessionId);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('liked_songs')
          .insert({
            track_id: trackId,
            user_session: sessionId
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  return {
    releases,
    loading,
    addRelease,
    updateRelease,
    deleteRelease,
    toggleFeatured,
    updateTrackLyrics,
    getLikedSongs,
    toggleLike,
    refetch: fetchReleases
  };
};
