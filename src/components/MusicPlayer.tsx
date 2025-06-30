
import React from 'react';
import { useMusic } from '../contexts/MusicContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Heart } from 'lucide-react';

export const MusicPlayer: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, pauseTrack, toggleLike, likedSongs } = useMusic();

  if (!currentTrack) return null;

  const isLiked = likedSongs.includes(currentTrack.id);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gray-800 rounded overflow-hidden flex-shrink-0">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-white truncate">{currentTrack.title}</h4>
              <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
            </div>
            <Button
              onClick={() => toggleLike(currentTrack.id)}
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 flex-shrink-0 mx-8">
            <Button variant="ghost" size="sm" disabled>
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={isPlaying ? pauseTrack : () => playTrack(currentTrack)}
              className="bg-white text-black hover:bg-gray-200 rounded-full w-10 h-10 p-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button variant="ghost" size="sm" disabled>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Duration */}
          <div className="text-sm text-gray-400 flex-shrink-0">
            {formatDuration(currentTrack.duration)}
          </div>
        </div>
      </div>
    </div>
  );
};
