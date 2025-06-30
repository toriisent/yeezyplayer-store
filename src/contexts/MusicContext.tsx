
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string;
  duration: number;
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
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  toggleLike: (trackId: string) => void;
  addRelease: (release: Release) => void;
  updateRelease: (release: Release) => void;
  deleteRelease: (releaseId: string) => void;
  toggleFeatured: (releaseId: string) => void;
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
  const [releases, setReleases] = useState<Release[]>([
    {
      id: '1',
      title: 'The Life of Pablo',
      type: 'album',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      releaseDate: '2016-02-14',
      isFeatured: true,
      tracks: [
        {
          id: '1-1',
          title: 'Ultralight Beam',
          artist: 'Kanye West',
          audioUrl: '',
          coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
          duration: 324
        },
        {
          id: '1-2',
          title: 'Father Stretch My Hands Pt. 1',
          artist: 'Kanye West',
          audioUrl: '',
          coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
          duration: 256
        }
      ]
    },
    {
      id: '2',
      title: 'Donda',
      type: 'album',
      coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=400&fit=crop',
      releaseDate: '2021-08-29',
      isFeatured: true,
      tracks: [
        {
          id: '2-1',
          title: 'Donda Chant',
          artist: 'Kanye West',
          audioUrl: '',
          coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=400&fit=crop',
          duration: 52
        }
      ]
    }
  ]);
  
  const [likedSongs, setLikedSongs] = useState<string[]>(() => {
    const saved = localStorage.getItem('kanye-player-liked');
    return saved ? JSON.parse(saved) : [];
  });

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const pauseTrack = () => {
    setIsPlaying(false);
  };

  const toggleLike = (trackId: string) => {
    const newLikedSongs = likedSongs.includes(trackId)
      ? likedSongs.filter(id => id !== trackId)
      : [...likedSongs, trackId];
    
    setLikedSongs(newLikedSongs);
    localStorage.setItem('kanye-player-liked', JSON.stringify(newLikedSongs));
  };

  const addRelease = (release: Release) => {
    setReleases(prev => [...prev, release]);
  };

  const updateRelease = (release: Release) => {
    setReleases(prev => prev.map(r => r.id === release.id ? release : r));
  };

  const deleteRelease = (releaseId: string) => {
    setReleases(prev => prev.filter(r => r.id !== releaseId));
  };

  const toggleFeatured = (releaseId: string) => {
    setReleases(prev => prev.map(r => 
      r.id === releaseId ? { ...r, isFeatured: !r.isFeatured } : r
    ));
  };

  return (
    <MusicContext.Provider value={{
      currentTrack,
      isPlaying,
      releases,
      likedSongs,
      playTrack,
      pauseTrack,
      toggleLike,
      addRelease,
      updateRelease,
      deleteRelease,
      toggleFeatured
    }}>
      {children}
    </MusicContext.Provider>
  );
};
