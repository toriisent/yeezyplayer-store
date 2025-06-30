
import React from 'react';
import { ReleaseCard } from '../components/ReleaseCard';
import { useMusic } from '../contexts/MusicContext';

const Index: React.FC = () => {
  const { releases } = useMusic();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* All Releases */}
        {releases.length > 0 && (
          <section className="animate-slide-in-right">
            <h2 className="text-3xl font-bold mb-8 text-white">All Releases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {releases.map((release, index) => (
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
