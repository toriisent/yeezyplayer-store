
import React from 'react';
import { ReleaseCard } from '../components/ReleaseCard';
import { useMusic } from '../contexts/MusicContext';

const Index: React.FC = () => {
  const { releases } = useMusic();
  const featuredReleases = releases.filter(release => release.isFeatured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section - Simplified */}
        <section className="text-center py-16 animate-scale-in">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent animate-shimmer">
              Music Collection
            </h1>
            <div className="flex justify-center gap-8 text-white animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{releases.length}</div>
                <div className="text-sm text-gray-300">Releases</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {releases.reduce((total, release) => total + release.tracks.length, 0)}
                </div>
                <div className="text-sm text-gray-300">Tracks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{featuredReleases.length}</div>
                <div className="text-sm text-gray-300">Featured</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Releases */}
        {featuredReleases.length > 0 && (
          <section className="animate-slide-in-right">
            <h2 className="text-3xl font-bold mb-8 text-white">Featured Releases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredReleases.map((release, index) => (
                <div 
                  key={release.id} 
                  className="animate-fade-in hover-scale"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <ReleaseCard release={release} />
                </div>
              ))}
            </div>
          </section>
        )}

        {releases.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-400">No releases yet</h2>
            <p className="text-gray-500">Use the admin panel to add some music to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
