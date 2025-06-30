
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusic } from '../contexts/MusicContext';
import { TrackList } from '../components/TrackList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play } from 'lucide-react';

const ReleaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { releases, playTrack } = useMusic();

  const release = releases.find(r => r.id === id);

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

  const handlePlayAll = () => {
    if (release.tracks.length > 0) {
      playTrack(release.tracks[0]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
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
              <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">
                {release.type}
              </p>
              <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight">
                {release.title}
              </h1>
              <p className="text-gray-400 mb-6">
                Kanye West • {new Date(release.releaseDate).getFullYear()} • {release.tracks.length} tracks
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePlayAll}
                size="lg"
                className="bg-white text-black hover:bg-gray-200 font-semibold px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                Play
              </Button>
            </div>
          </div>
        </div>

        {/* Track List */}
        <div className="bg-gray-900/20 rounded-lg p-6">
          <TrackList tracks={release.tracks} />
        </div>
      </div>
    </div>
  );
};

export default ReleaseDetail;
