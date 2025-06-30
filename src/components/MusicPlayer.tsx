
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
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-xl border-t border-gray-700/50 z-50 animate-slide-in-right">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden flex-shrink-0 shadow-lg hover:scale-105 transition-transform duration-200">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-white truncate hover:text-gray-200 transition-colors duration-200">
                {currentTrack.title}
              </h4>
              <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
            </div>
            <Button
              onClick={() => toggleLike(currentTrack.id)}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 hover:scale-110 transition-transform duration-200"
            >
              <Heart className={`w-4 h-4 transition-all duration-200 ${
                isLiked 
                  ? 'fill-red-500 text-red-500 animate-pulse' 
                  : 'text-gray-400 hover:text-red-400'
              }`} />
            </Button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 flex-shrink-0 mx-8">
            <Button 
              variant="ghost" 
              size="sm" 
              disabled
              className="hover:scale-110 transition-transform duration-200 opacity-50"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={isPlaying ? pauseTrack : () => playTrack(currentTrack)}
              className="bg-white text-black hover:bg-gray-200 rounded-full w-12 h-12 p-0 shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-200"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-1" />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              disabled
              className="hover:scale-110 transition-transform duration-200 opacity-50"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Duration */}
          <div className="text-sm text-gray-400 flex-shrink-0 font-mono">
            {formatDuration(currentTrack.duration)}
          </div>
        </div>
      </div>
    </div>
  );
};
