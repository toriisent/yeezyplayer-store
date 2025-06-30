
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Release } from '../contexts/MusicContext';
import { useMusic } from '../contexts/MusicContext';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface ReleaseCardProps {
  release: Release;
}

export const ReleaseCard: React.FC<ReleaseCardProps> = ({ release }) => {
  const navigate = useNavigate();
  const { playTrack } = useMusic();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (release.tracks.length > 0) {
      playTrack(release.tracks[0]);
    }
  };

  const handleCardClick = () => {
    navigate(`/release/${release.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-gray-900/20 rounded-lg p-4 hover:bg-gray-800/40 transition-all duration-300 cursor-pointer"
    >
      <div className="relative mb-4">
        <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
          <img
            src={release.coverUrl}
            alt={release.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        <Button
          onClick={handlePlay}
          size="sm"
          className="absolute bottom-2 right-2 bg-white text-black hover:bg-gray-200 rounded-full w-10 h-10 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
        >
          <Play className="w-4 h-4" />
        </Button>
      </div>
      
      <div>
        <h3 className="font-semibold text-white truncate mb-1">{release.title}</h3>
        <p className="text-sm text-gray-400 capitalize">{release.type}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(release.releaseDate).getFullYear()}
        </p>
      </div>
    </div>
  );
};
