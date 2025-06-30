
import React from 'react';
import { Heart } from 'lucide-react';
import { TrackList } from '../components/TrackList';
import { useMusic } from '../contexts/MusicContext';

const LikedSongs: React.FC = () => {
  const { releases, likedSongs } = useMusic();

  const allTracks = releases.flatMap(release => release.tracks);
  const likedTracks = allTracks.filter(track => likedSongs.includes(track.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Liked Songs
            </h1>
            <p className="text-gray-400">{likedTracks.length} liked songs</p>
          </div>
        </div>

        {likedTracks.length > 0 ? (
          <div className="animate-slide-in-right">
            <TrackList tracks={likedTracks} />
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-gray-400">No liked songs yet</h2>
            <p className="text-gray-500">Start liking songs to see them here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongs;
