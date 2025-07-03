
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseMusic } from '../hooks/useSupabaseMusic';

export interface LyricLine {
  time: number; // Time in seconds when this line starts
  words: Array<{
    word: string;
    start: number; // Start time for this word in seconds
    end: number; // End time for this word in seconds
  }>;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string;
  duration: number;
  lyrics?: LyricLine[]; // Optional lyrics with timing
}

export interface Release {
  id: string;
  title: string;
  type: 'single' | 'ep' | 'album';
  coverUrl: string;
  releaseDate: string;
  tracks: Track[];
  isFeatured: boolean;
}

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  releases: Release[];
  likedSongs: string[];
  loading: boolean;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  toggleLike: (trackId: string) => Promise<void>;
  addRelease: (release: Release) => void;
  updateRelease: (release: Release) => void;
  deleteRelease: (releaseId: string) => void;
  toggleFeatured: (releaseId: string) => void;
  getAudioDuration: (url: string) => Promise<number>;
  updateTrackLyrics: (trackId: string, lyrics: LyricLine[]) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

interface MusicProviderProps {
  children: ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedSongs, setLikedSongs] = useState<string[]>([]);
  
  const {
    releases,
    loading,
    addRelease: addReleaseToDb,
    updateRelease: updateReleaseInDb,
    deleteRelease: deleteReleaseFromDb,
    toggleFeatured: toggleFeaturedInDb,
    updateTrackLyrics: updateTrackLyricsInDb,
    getLikedSongs,
    toggleLike: toggleLikeInDb
  } = useSupabaseMusic();

  // Load liked songs on mount and when user changes
  useEffect(() => {
    const loadLikedSongs = async () => {
      try {
        const liked = await getLikedSongs();
        setLikedSongs(liked);
      } catch (error) {
        console.error('Error loading liked songs:', error);
      }
    };
    loadLikedSongs();
  }, [getLikedSongs]);

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const pauseTrack = () => {
    setIsPlaying(false);
  };

  const toggleLike = async (trackId: string) => {
    try {
      // Optimistically update UI
      const wasLiked = likedSongs.includes(trackId);
      if (wasLiked) {
        setLikedSongs(prev => prev.filter(id => id !== trackId));
      } else {
        setLikedSongs(prev => [...prev, trackId]);
      }

      // Update database
      await toggleLikeInDb(trackId);
      
      // Refresh from database to ensure consistency
      const updatedLikedSongs = await getLikedSongs();
      setLikedSongs(updatedLikedSongs);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      const likedFromDb = await getLikedSongs();
      setLikedSongs(likedFromDb);
    }
  };

  const getAudioDuration = (url: string): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        resolve(Math.floor(audio.duration) || 180);
      });
      audio.addEventListener('error', () => {
        resolve(180); // Default duration if error
      });
      audio.src = url;
    });
  };

  const addRelease = (release: Release) => {
    addReleaseToDb(release);
  };

  const updateRelease = (release: Release) => {
    updateReleaseInDb(release);
  };

  const deleteRelease = (releaseId: string) => {
    deleteReleaseFromDb(releaseId);
  };

  const toggleFeatured = (releaseId: string) => {
    toggleFeaturedInDb(releaseId);
  };

  const updateTrackLyrics = (trackId: string, lyrics: LyricLine[]) => {
    updateTrackLyricsInDb(trackId, lyrics);
  };

  return (
    <MusicContext.Provider value={{
      currentTrack,
      isPlaying,
      releases,
      likedSongs,
      loading,
      playTrack,
      pauseTrack,
      toggleLike,
      addRelease,
      updateRelease,
      deleteRelease,
      toggleFeatured,
      getAudioDuration,
      updateTrackLyrics
    }}>
      {children}
    </MusicContext.Provider>
  );
};
