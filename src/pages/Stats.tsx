
import React from 'react';
import { useMusic } from '../contexts/MusicContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Music, Heart, Calendar } from 'lucide-react';

const Stats: React.FC = () => {
  const { releases, likedSongs } = useMusic();
  
  const totalTracks = releases.reduce((total, release) => total + release.tracks.length, 0);
  const totalDuration = releases.reduce((total, release) => 
    total + release.tracks.reduce((trackTotal, track) => trackTotal + track.duration, 0), 0
  );
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);  
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const releasesByType = releases.reduce((acc, release) => {
    acc[release.type] = (acc[release.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Music Statistics
          </h1>
          <p className="text-gray-400">Overview of your music collection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-700 animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Releases</CardTitle>
              <Music className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{releases.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Tracks</CardTitle>
              <BarChart className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalTracks}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Liked Songs</CardTitle>
              <Heart className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{likedSongs.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Duration</CardTitle>
              <Calendar className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatDuration(totalDuration)}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900/50 border-gray-700 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle className="text-white">Release Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(releasesByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{type}s</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;
