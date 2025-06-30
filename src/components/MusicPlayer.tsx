
import React, { useState, useRef, useEffect } from 'react';
import { useMusic } from '../contexts/MusicContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, Repeat, Mic } from 'lucide-react';
import { LyricsDisplay } from './LyricsDisplay';

export const MusicPlayer: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, pauseTrack, toggleLike, likedSongs } = useMusic();
  const [volume, setVolume] = useState([50]);
  const [progress, setProgress] = useState([0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentTrack]);

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
    if (audioRef.current && !isDragging) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || duration;
      setCurrentTime(current);
      if (total > 0) {
        setProgress([(current / total) * 100]);
      }
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current) {
      setIsDragging(true);
      const total = audioRef.current.duration || duration;
      const newTime = (value[0] / 100) * total;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(value);
      setTimeout(() => setIsDragging(false), 50);
    }
  };

  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration || 0);
    }
  };

  const handleSkipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const handleLike = () => {
    if (currentTrack) {
      toggleLike(currentTrack.id);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  const isLiked = likedSongs.includes(currentTrack.id);
  const totalDuration = duration || currentTrack.duration;
  const hasLyrics = currentTrack.lyrics && currentTrack.lyrics.length > 0;

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
      
      <LyricsDisplay 
        currentTime={currentTime}
        isVisible={showLyrics}
        onClose={() => setShowLyrics(false)}
      />
      
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-gray-800/50 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          {/* Progress Bar */}
          <div className="mb-3">
            <Slider
              value={progress}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="w-full h-1 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[data-orientation=horizontal]]:h-1 [&_[data-orientation=horizontal]]:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 items-center gap-6">
            {/* Track Info - Left */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 shadow-xl">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-white truncate text-sm">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Controls - Center */}
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={handleLike}
                variant="ghost"
                size="sm"
                className="hover:scale-105 transition-all duration-200 rounded-full p-2 hover:bg-gray-800/50"
              >
                <Heart className={`w-4 h-4 transition-all duration-200 ${
                  isLiked 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-400 hover:text-red-400'
                }`} />
              </Button>

              <Button 
                onClick={handleSkipBackward}
                variant="ghost" 
                size="sm" 
                className="hover:scale-105 transition-transform duration-200 rounded-full p-2 hover:bg-gray-800/50 text-gray-300"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={isPlaying ? pauseTrack : () => playTrack(currentTrack)}
                className="bg-white text-black hover:bg-gray-100 rounded-full w-12 h-12 p-0 shadow-lg hover:scale-105 transition-all duration-200"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>
              
              <Button 
                onClick={handleSkipForward}
                variant="ghost" 
                size="sm" 
                className="hover:scale-105 transition-transform duration-200 rounded-full p-2 hover:bg-gray-800/50 text-gray-300"
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => setIsLooping(!isLooping)}
                variant="ghost"
                size="sm"
                className={`hover:scale-105 transition-all duration-200 rounded-full p-2 ${
                  isLooping ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => setShowLyrics(!showLyrics)}
                variant="ghost"
                size="sm"
                className={`hover:scale-105 transition-all duration-200 rounded-full p-2 ${
                  showLyrics ? 'text-white bg-gray-800' : hasLyrics ? 'text-gray-300 hover:text-white hover:bg-gray-800/50' : 'text-gray-600 opacity-50 cursor-not-allowed'
                }`}
                disabled={!hasLyrics}
                title={hasLyrics ? 'Show lyrics' : 'No lyrics available'}
              >
                <Mic className="w-4 h-4" />
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
                  className="w-full h-1 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_[data-orientation=horizontal]]:h-1 [&_[data-orientation=horizontal]]:bg-gray-700"
                />
              </div>
              <div className="text-xs text-gray-400 font-mono w-6 text-right">
                {volume[0]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
