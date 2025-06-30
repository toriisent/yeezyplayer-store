
import React from 'react';
import { Track } from '../contexts/MusicContext';
import { useMusic } from '../contexts/MusicContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, Heart } from 'lucide-react';

interface TrackListProps {
  tracks: Track[];
}

export const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
  const { currentTrack, isPlaying, playTrack, pauseTrack, toggleLike, likedSongs } = useMusic();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isLiked = likedSongs.includes(track.id);
        
        return (
          <div
            key={track.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800/30 transition-colors group"
          >
            <div className="w-8 text-center">
              {isCurrentTrack && isPlaying ? (
                <Button
                  onClick={pauseTrack}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-white"
                >
                  <Pause className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => playTrack(track)}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Play className="w-4 h-4" />
                </Button>
              )}
              <span className="text-gray-400 text-sm group-hover:hidden">
                {index + 1}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium truncate ${isCurrentTrack ? 'text-white' : 'text-gray-200'}`}>
                {track.title}
              </h4>
              <p className="text-sm text-gray-400 truncate">{track.artist}</p>
            </div>
            
            <Button
              onClick={() => toggleLike(track.id)}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
            
            <div className="text-sm text-gray-400 w-12 text-right">
              {formatDuration(track.duration)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
