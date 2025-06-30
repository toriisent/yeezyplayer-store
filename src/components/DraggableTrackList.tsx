
import React, { useState } from 'react';
import { Track } from '../contexts/MusicContext';
import { useMusic } from '../contexts/MusicContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, Heart, GripVertical } from 'lucide-react';

interface DraggableTrackListProps {
  tracks: Track[];
  onReorder?: (tracks: Track[]) => void;
  isDraggable?: boolean;
}

export const DraggableTrackList: React.FC<DraggableTrackListProps> = ({ 
  tracks, 
  onReorder,
  isDraggable = false 
}) => {
  const { currentTrack, isPlaying, playTrack, pauseTrack, toggleLike, likedSongs } = useMusic();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isDraggable) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isDraggable) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    if (!isDraggable) return;
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!isDraggable || draggedIndex === null) return;
    e.preventDefault();
    
    const newTracks = [...tracks];
    const draggedTrack = newTracks[draggedIndex];
    newTracks.splice(draggedIndex, 1);
    newTracks.splice(dropIndex, 0, draggedTrack);
    
    onReorder?.(newTracks);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-2">
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isLiked = likedSongs.includes(track.id);
        const isDraggedOver = dragOverIndex === index;
        const isDragged = draggedIndex === index;
        
        return (
          <div
            key={track.id}
            draggable={isDraggable}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group ${
              isDragged 
                ? 'opacity-50 scale-95' 
                : isDraggedOver 
                  ? 'bg-gray-700/50 scale-102' 
                  : 'hover:bg-gray-800/30'
            } ${isDraggable ? 'cursor-move' : ''}`}
          >
            {isDraggable && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <GripVertical className="w-4 h-4 text-gray-500" />
              </div>
            )}
            
            <div className="w-8 text-center">
              {isCurrentTrack && isPlaying ? (
                <Button
                  onClick={pauseTrack}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-white hover:scale-110 transition-transform duration-200"
                >
                  <Pause className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => playTrack(track)}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-white opacity-0 group-hover:opacity-100 hover:scale-110 transition-all duration-200"
                >
                  <Play className="w-4 h-4" />
                </Button>
              )}
              <span className="text-gray-400 text-sm group-hover:hidden">
                {index + 1}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium truncate transition-colors duration-200 ${
                isCurrentTrack ? 'text-white' : 'text-gray-200'
              }`}>
                {track.title}
              </h4>
              <p className="text-sm text-gray-400 truncate">{track.artist}</p>
            </div>
            
            <Button
              onClick={() => toggleLike(track.id)}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 hover:scale-110 transition-all duration-200"
            >
              <Heart className={`w-4 h-4 transition-colors duration-200 ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'
              }`} />
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
