
import React, { useState, useEffect } from 'react';
import { useMusic } from '../contexts/MusicContext';
import { LyricLine } from '../contexts/MusicContext';
import { Button } from '@/components/ui/button';
import { Music, X } from 'lucide-react';

interface LyricsDisplayProps {
  currentTime: number;
  isVisible: boolean;
  onClose: () => void;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ 
  currentTime, 
  isVisible, 
  onClose 
}) => {
  const { currentTrack } = useMusic();
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);

  useEffect(() => {
    if (!currentTrack?.lyrics) return;

    // Find the current active line and word
    let currentLineIndex = -1;
    let currentWordIndex = -1;

    for (let i = 0; i < currentTrack.lyrics.length; i++) {
      const line = currentTrack.lyrics[i];
      const nextLine = currentTrack.lyrics[i + 1];
      
      if (currentTime >= line.time && (!nextLine || currentTime < nextLine.time)) {
        currentLineIndex = i;
        
        // Find active word within the line
        for (let j = 0; j < line.words.length; j++) {
          const word = line.words[j];
          if (currentTime >= word.start && currentTime <= word.end) {
            currentWordIndex = j;
            break;
          }
        }
        break;
      }
    }

    setActiveLineIndex(currentLineIndex);
    setActiveWordIndex(currentWordIndex);
  }, [currentTime, currentTrack?.lyrics]);

  if (!isVisible || !currentTrack?.lyrics) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-4xl h-full max-h-[90vh] relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 p-6 bg-gradient-to-r from-white/10 to-white/5 rounded-lg backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden shadow-xl">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{currentTrack.title}</h2>
              <p className="text-gray-300">{currentTrack.artist}</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-3"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Lyrics Container */}
        <div className="h-full max-h-[calc(90vh-200px)] overflow-y-auto px-6">
          <div className="space-y-8 text-center">
            {currentTrack.lyrics.map((line, lineIndex) => (
              <div
                key={lineIndex}
                className={`transition-all duration-500 ${
                  lineIndex === activeLineIndex
                    ? 'transform scale-110'
                    : lineIndex < activeLineIndex
                    ? 'opacity-40'
                    : 'opacity-60'
                }`}
              >
                <div className="text-2xl md:text-4xl font-light leading-relaxed">
                  {line.words.map((wordObj, wordIndex) => (
                    <span
                      key={wordIndex}
                      className={`inline-block mx-1 transition-all duration-300 ${
                        lineIndex === activeLineIndex && wordIndex <= activeWordIndex
                          ? 'text-white font-medium bg-gradient-to-r from-white/20 to-white/10 px-2 py-1 rounded-lg shadow-lg transform scale-105'
                          : lineIndex === activeLineIndex
                          ? 'text-gray-300'
                          : lineIndex < activeLineIndex
                          ? 'text-gray-500'
                          : 'text-gray-400'
                      }`}
                      style={{
                        transitionDelay: lineIndex === activeLineIndex && wordIndex <= activeWordIndex 
                          ? `${(wordObj.start - line.time) * 100}ms` 
                          : '0ms'
                      }}
                    >
                      {wordObj.word}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            
            {currentTrack.lyrics.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Music className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-xl">No lyrics available</p>
                <p className="text-sm">Lyrics can be added through the admin panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
