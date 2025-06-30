
import React, { useState, useRef, useEffect } from 'react';
import { useMusic } from '../contexts/MusicContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, Repeat } from 'lucide-react';

export const MusicPlayer: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, pauseTrack, toggleLike, likedSongs } = useMusic();
  const [volume, setVolume] = useState([50]);
  const [progress, setProgress] = useState([0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current && currentTrack) {
      const current = audioRef.current.currentTime;
      const duration = currentTrack.duration;
      setCurrentTime(current);
      setProgress([(current / duration) * 100]);
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current && currentTrack) {
      const newTime = (value[0] / 100) * currentTrack.duration;
      audioRef.current.currentTime = newTime;
      setProgress(value);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  const isLiked = likedSongs.includes(currentTrack.id);

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          if (isLooping) {
            audioRef.current?.play().catch(console.error);
          } else {
            pauseTrack();
          }
        }}
        loop={isLooping}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-xl border-t border-gray-700/50 z-50 animate-slide-in-right">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={progress}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            {/* Track Info - Left */}
            <div className="flex items-center gap-4 min-w-0">
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

            {/* Controls - Center */}
            <div className="flex items-center justify-center gap-4">
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

              <Button
                onClick={() => setIsLooping(!isLooping)}
                variant="ghost"
                size="sm"
                className={`hover:scale-110 transition-transform duration-200 ${
                  isLooping ? 'text-white bg-white/10' : 'text-gray-400'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </Button>
            </div>

            {/* Volume Control - Right */}
            <div className="flex items-center justify-end gap-3">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <div className="w-24">
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="text-sm text-gray-400 font-mono w-8">
                {volume[0]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
