
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
  const [isDragging, setIsDragging] = useState(false);
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
    if (audioRef.current && currentTrack && !isDragging) {
      const current = audioRef.current.currentTime;
      const duration = currentTrack.duration;
      setCurrentTime(current);
      setProgress([(current / duration) * 100]);
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current && currentTrack) {
      setIsDragging(true);
      const newTime = (value[0] / 100) * currentTrack.duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(value);
      setTimeout(() => setIsDragging(false), 100);
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
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 backdrop-blur-xl border-t border-gray-700/30 z-50 animate-slide-in-right">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Modern Progress Bar */}
          <div className="mb-4">
            <Slider
              value={progress}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg [&_[role=slider]]:hover:scale-110 [&_[role=slider]]:transition-transform"
            />
            <div className="flex justify-between text-xs text-gray-300 mt-2 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            {/* Track Info - Left */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden flex-shrink-0 shadow-2xl hover:scale-105 transition-transform duration-300 ring-1 ring-white/10">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-white truncate hover:text-gray-200 transition-colors duration-200 text-sm">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
              </div>
              <Button
                onClick={() => toggleLike(currentTrack.id)}
                variant="ghost"
                size="sm"
                className="flex-shrink-0 hover:scale-110 transition-all duration-300 rounded-full p-2"
              >
                <Heart className={`w-5 h-5 transition-all duration-300 ${
                  isLiked 
                    ? 'fill-red-500 text-red-500 drop-shadow-lg' 
                    : 'text-gray-400 hover:text-red-400'
                }`} />
              </Button>
            </div>

            {/* Controls - Center */}
            <div className="flex items-center justify-center gap-6">
              <Button 
                variant="ghost" 
                size="sm" 
                disabled
                className="hover:scale-110 transition-transform duration-200 opacity-40 rounded-full p-2"
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={isPlaying ? pauseTrack : () => playTrack(currentTrack)}
                className="bg-white text-black hover:bg-gray-100 rounded-full w-14 h-14 p-0 shadow-2xl hover:scale-110 hover:shadow-3xl transition-all duration-300 ring-2 ring-white/20"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                disabled
                className="hover:scale-110 transition-transform duration-200 opacity-40 rounded-full p-2"
              >
                <SkipForward className="w-5 h-5" />
              </Button>

              <Button
                onClick={() => setIsLooping(!isLooping)}
                variant="ghost"
                size="sm"
                className={`hover:scale-110 transition-all duration-300 rounded-full p-2 ${
                  isLooping ? 'text-white bg-white/10 shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Repeat className="w-5 h-5" />
              </Button>
            </div>

            {/* Volume Control - Right */}
            <div className="flex items-center justify-end gap-4">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <div className="w-28">
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_[role=slider]]:w-4 [&_[role=slider]]:h-4"
                />
              </div>
              <div className="text-xs text-gray-400 font-mono w-8 text-right">
                {volume[0]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
