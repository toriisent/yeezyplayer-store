
import React, { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { TrackList } from '../components/TrackList';
import { useMusic } from '../contexts/MusicContext';

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { releases } = useMusic();

  const allTracks = releases.flatMap(release => release.tracks);
  const filteredTracks = allTracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    releases.find(r => r.tracks.includes(track))?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Search Music
          </h1>
          <p className="text-gray-400">Find your favorite tracks and albums</p>
        </div>

        <div className="mb-8">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {searchQuery && (
          <div className="animate-slide-in-right">
            <h2 className="text-2xl font-semibold mb-6 text-white">
              Search Results ({filteredTracks.length})
            </h2>
            {filteredTracks.length > 0 ? (
              <TrackList tracks={filteredTracks} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No tracks found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {!searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Start typing to search for music...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
