
import React, { useState } from 'react';
import { useMusic } from '../contexts/MusicContext';
import { useAdmin } from '../contexts/AdminContext';
import { ReleaseCard } from '../components/ReleaseCard';
import { SearchBar } from '../components/SearchBar';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const Index = () => {
  const { releases } = useMusic();
  const { openAdminPanel } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');

  const featuredReleases = releases.filter(release => release.isFeatured);
  const allReleases = releases.filter(release => 
    release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    release.tracks.some(track => 
      track.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const releasesByType = {
    single: allReleases.filter(r => r.type === 'single'),
    ep: allReleases.filter(r => r.type === 'ep'),
    album: allReleases.filter(r => r.type === 'album')
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">KANYE PLAYER</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={openAdminPanel}
              className="text-gray-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-12">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Featured Releases */}
        {featuredReleases.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredReleases.map(release => (
                <ReleaseCard key={release.id} release={release} />
              ))}
            </div>
          </section>
        )}

        {/* Albums */}
        {releasesByType.album.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Albums</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {releasesByType.album.map(release => (
                <ReleaseCard key={release.id} release={release} />
              ))}
            </div>
          </section>
        )}

        {/* EPs */}
        {releasesByType.ep.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">EPs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {releasesByType.ep.map(release => (
                <ReleaseCard key={release.id} release={release} />
              ))}
            </div>
          </section>
        )}

        {/* Singles */}
        {releasesByType.single.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Singles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {releasesByType.single.map(release => (
                <ReleaseCard key={release.id} release={release} />
              ))}
            </div>
          </section>
        )}

        {/* No results */}
        {searchQuery && allReleases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No releases found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
