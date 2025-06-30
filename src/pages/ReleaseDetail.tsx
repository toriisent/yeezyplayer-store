import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusic } from '../contexts/MusicContext';
import { TrackList } from '../components/TrackList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause } from 'lucide-react';

const ReleaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { releases, playTrack, currentTrack, isPlaying, pauseTrack } = useMusic();
  const [dominantColor, setDominantColor] = useState('rgb(0, 0, 0)');

  const release = releases.find(r => r.id === id);

  // Check if any track from this release is currently playing
  const isReleaseTrackPlaying = currentTrack && release?.tracks.some(track => track.id === currentTrack.id) && isPlaying;

  useEffect(() => {
    if (release?.coverUrl) {
      // Create a canvas to extract dominant color from image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          let r = 0, g = 0, b = 0;
          let count = 0;
          
          // Sample every 10th pixel for performance
          for (let i = 0; i < data.length; i += 40) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
          
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          
          // Darken the color for background
          r = Math.floor(r * 0.3);
          g = Math.floor(g * 0.3);
          b = Math.floor(b * 0.3);
          
          setDominantColor(`rgb(${r}, ${g}, ${b})`);
        }
      };
      img.src = release.coverUrl;
    }
  }, [release?.coverUrl]);

  if (!release) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Release not found</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (isReleaseTrackPlaying) {
      pauseTrack();
    } else if (release.tracks.length > 0) {
      playTrack(release.tracks[0]);
    }
  };

  // Get the artist from the first track, or fall back to a default
  const releaseArtist = release.tracks.length > 0 ? release.tracks[0].artist : 'Unknown Artist';

  return (
    <div 
      className="min-h-screen text-white"
      style={{
        background: `linear-gradient(to bottom, ${dominantColor} 0%, rgba(0,0,0,0.8) 50%, rgb(0,0,0) 100%)`
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Release Header */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="lg:w-1/3">
            <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
              <img
                src={release.coverUrl}
                alt={release.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="lg:w-2/3 flex flex-col justify-end">
            <div className="mb-4">
              <p className="text-sm text-gray-300 uppercase tracking-wide mb-2">
                {release.type}
              </p>
              <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight">
                {release.title}
              </h1>
              <p className="text-gray-300 mb-6">
                {releaseArtist} • {new Date(release.releaseDate).getFullYear()} • {release.tracks.length} tracks
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePlayPause}
                size="lg"
                className="bg-white text-black hover:bg-gray-200 font-semibold px-8"
              >
                {isReleaseTrackPlaying ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Playing
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Play
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Track List */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <TrackList tracks={release.tracks} />
        </div>
      </div>
    </div>
  );
};

export default ReleaseDetail;
