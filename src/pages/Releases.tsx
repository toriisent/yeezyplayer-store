
import React from 'react';
import { ReleaseCard } from '../components/ReleaseCard';
import { useMusic } from '../contexts/MusicContext';

const Releases: React.FC = () => {
  const { releases } = useMusic();
  const recentReleases = releases.slice().reverse().slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            All Releases
          </h1>
          <p className="text-gray-400">Browse the complete music collection</p>
        </div>

        {/* Latest Releases */}
        {releases.length > 0 && (
          <section className="animate-slide-in-left">
            <h2 className="text-3xl font-bold mb-8 text-white">Latest Releases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentReleases.map((release, index) => (
                <div 
                  key={release.id} 
                  className="animate-fade-in hover-scale"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ReleaseCard release={release} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Releases */}
        {releases.length > 6 && (
          <section className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-8 text-white">Complete Discography</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {releases.map((release, index) => (
                <div 
                  key={release.id} 
                  className="animate-fade-in hover-scale"
                  style={{ animationDelay: `${index * 50}ms` }}
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

export default Releases;
