
import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useMusic } from '../contexts/MusicContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2, Star, Shield, Music2, Upload } from 'lucide-react';
import { Release } from '../contexts/MusicContext';

export const AdminPanel: React.FC = () => {
  const { isAdminPanelOpen, isAuthenticated, login, logout, closeAdminPanel } = useAdmin();
  const { releases, addRelease, deleteRelease, toggleFeatured } = useMusic();
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'manage' | 'add'>('login');

  // Form state for adding releases
  const [newRelease, setNewRelease] = useState({
    title: '',
    type: 'single' as 'single' | 'ep' | 'album',
    coverUrl: '',
    releaseDate: '',
    tracks: [{ title: '', duration: 0 }]
  });

  const handleLogin = () => {
    if (login(password)) {
      setActiveTab('manage');
      setLoginError('');
      setPassword('');
    } else {
      setLoginError('Invalid password');
    }
  };

  const handleLogout = () => {
    logout();
    setActiveTab('login');
    setPassword('');
    setLoginError('');
  };

  const handleAddRelease = () => {
    if (!newRelease.title || !newRelease.coverUrl || !newRelease.releaseDate) {
      return;
    }

    const release: Release = {
      id: Date.now().toString(),
      title: newRelease.title,
      type: newRelease.type,
      coverUrl: newRelease.coverUrl,
      releaseDate: newRelease.releaseDate,
      isFeatured: false,
      tracks: newRelease.tracks.map((track, index) => ({
        id: `${Date.now()}-${index}`,
        title: track.title || `Track ${index + 1}`,
        artist: 'Kanye West',
        audioUrl: '',
        coverUrl: newRelease.coverUrl,
        duration: track.duration || 180
      }))
    };

    addRelease(release);
    setNewRelease({
      title: '',
      type: 'single',
      coverUrl: '',
      releaseDate: '',
      tracks: [{ title: '', duration: 0 }]
    });
    setActiveTab('manage');
  };

  const addTrack = () => {
    setNewRelease(prev => ({
      ...prev,
      tracks: [...prev.tracks, { title: '', duration: 0 }]
    }));
  };

  const updateTrack = (index: number, field: string, value: string | number) => {
    setNewRelease(prev => ({
      ...prev,
      tracks: prev.tracks.map((track, i) => 
        i === index ? { ...track, [field]: value } : track
      )
    }));
  };

  const removeTrack = (index: number) => {
    setNewRelease(prev => ({
      ...prev,
      tracks: prev.tracks.filter((_, i) => i !== index)
    }));
  };

  if (!isAdminPanelOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="modern-card bg-black border border-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-black">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg animate-float">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white animate-shimmer">
                {isAuthenticated ? 'Admin Panel' : 'Admin Access'}
              </h2>
              <p className="text-gray-400 text-sm">Manage your music collection</p>
            </div>
          </div>
          <Button
            onClick={closeAdminPanel}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-white/10 hover-scale transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {!isAuthenticated ? (
            /* Login Form */
            <div className="max-w-md mx-auto animate-fade-in">
              <Card className="modern-card bg-gray-900/50 border-gray-700">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 rounded-full flex items-center justify-center mb-4 animate-float">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl">Secure Access Required</CardTitle>
                  <p className="text-gray-400 text-sm">Enter your admin credentials to continue</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300 font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      className="bg-black/50 border-gray-600 text-white focus:border-white/50 focus:ring-white/20 hover-scale"
                      placeholder="Enter admin password..."
                    />
                  </div>
                  {loginError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-fade-in">
                      <p className="text-red-400 text-sm font-medium">{loginError}</p>
                    </div>
                  )}
                  <Button onClick={handleLogin} className="w-full bg-white text-black hover:bg-gray-200 hover-scale transition-all duration-200">
                    <Shield className="w-4 h-4 mr-2" />
                    Access Admin Panel
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Admin Panel Content */
            <div className="animate-fade-in">
              {/* Tabs */}
              <div className="flex gap-2 mb-8 p-1 bg-gray-900/50 rounded-lg">
                <Button
                  onClick={() => setActiveTab('manage')}
                  variant={activeTab === 'manage' ? 'default' : 'ghost'}
                  className={`flex-1 hover-scale transition-all duration-200 ${
                    activeTab === 'manage' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Music2 className="w-4 h-4 mr-2" />
                  Manage Releases
                </Button>
                <Button
                  onClick={() => setActiveTab('add')}
                  variant={activeTab === 'add' ? 'default' : 'ghost'}
                  className={`flex-1 hover-scale transition-all duration-200 ${
                    activeTab === 'add' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Add Release
                </Button>
                <Button 
                  onClick={handleLogout} 
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 hover-scale transition-all duration-200"
                >
                  Logout
                </Button>
              </div>

              {activeTab === 'manage' && (
                <div className="space-y-6 animate-slide-in-right">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">Music Library</h3>
                    <Badge variant="secondary" className="bg-white/10 text-white">
                      {releases.length} releases
                    </Badge>
                  </div>
                  
                  <div className="grid gap-4">
                    {releases.map((release, index) => (
                      <Card 
                        key={release.id} 
                        className="modern-card bg-gray-900/30 border-gray-700 hover:bg-gray-900/50 hover-scale transition-all duration-200 animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-6">
                            <div className="relative">
                              <img
                                src={release.coverUrl}
                                alt={release.title}
                                className="w-20 h-20 rounded-lg object-cover shadow-lg"
                              />
                              {release.isFeatured && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse-soft">
                                  <Star className="w-3 h-3 text-black fill-current" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <h4 className="font-bold text-white text-lg">{release.title}</h4>
                              <div className="flex items-center gap-3">
                                <Badge 
                                  variant="outline" 
                                  className="capitalize border-gray-600 text-gray-300"
                                >
                                  {release.type}
                                </Badge>
                                <span className="text-gray-400 text-sm">
                                  {release.tracks.length} track{release.tracks.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <p className="text-gray-500 text-sm">{release.releaseDate}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => toggleFeatured(release.id)}
                                variant="ghost"
                                size="sm"
                                className={`hover-scale transition-all duration-200 ${
                                  release.isFeatured 
                                    ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-500/10' 
                                    : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                                }`}
                              >
                                <Star className={`w-5 h-5 ${release.isFeatured ? 'fill-current' : ''}`} />
                              </Button>
                              <Button
                                onClick={() => deleteRelease(release.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 hover-scale transition-all duration-200"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'add' && (
                <div className="space-y-8 animate-slide-in-right">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">Add New Release</h3>
                    <p className="text-gray-400">Upload a new album, EP, or single</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-gray-300 font-medium">Release Title</Label>
                        <Input
                          id="title"
                          value={newRelease.title}
                          onChange={(e) => setNewRelease(prev => ({ ...prev, title: e.target.value }))}
                          className="bg-black/50 border-gray-600 text-white focus:border-white/50 focus:ring-white/20 hover-scale"
                          placeholder="Enter release title..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-gray-300 font-medium">Release Type</Label>
                        <Select value={newRelease.type} onValueChange={(value: 'single' | 'ep' | 'album') => 
                          setNewRelease(prev => ({ ...prev, type: value }))
                        }>
                          <SelectTrigger className="bg-black/50 border-gray-600 text-white focus:border-white/50 hover-scale">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="ep">EP</SelectItem>
                            <SelectItem value="album">Album</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="coverUrl" className="text-gray-300 font-medium">Cover Image URL</Label>
                        <Input
                          id="coverUrl"
                          type="url"
                          value={newRelease.coverUrl}
                          onChange={(e) => setNewRelease(prev => ({ ...prev, coverUrl: e.target.value }))}
                          className="bg-black/50 border-gray-600 text-white focus:border-white/50 focus:ring-white/20 hover-scale"
                          placeholder="https://example.com/cover.jpg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="releaseDate" className="text-gray-300 font-medium">Release Date</Label>
                        <Input
                          id="releaseDate"
                          type="date"
                          value={newRelease.releaseDate}
                          onChange={(e) => setNewRelease(prev => ({ ...prev, releaseDate: e.target.value }))}
                          className="bg-black/50 border-gray-600 text-white focus:border-white/50 focus:ring-white/20 hover-scale"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300 font-medium">Track List</Label>
                        <Button 
                          onClick={addTrack} 
                          size="sm" 
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:text-white hover:bg-white/10 hover-scale transition-all duration-200"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Track
                        </Button>
                      </div>
                      
                      <div className="space-y-4 max-h-80 overflow-y-auto">
                        {newRelease.tracks.map((track, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-3 p-4 bg-gray-900/30 rounded-lg border border-gray-700 animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <span className="text-gray-400 text-sm font-medium w-8">{index + 1}</span>
                            <Input
                              placeholder={`Track ${index + 1} title`}
                              value={track.title}
                              onChange={(e) => updateTrack(index, 'title', e.target.value)}
                              className="bg-black/50 border-gray-600 text-white flex-1 hover-scale"
                            />
                            <Input
                              type="number"
                              placeholder="Duration"
                              value={track.duration || ''}
                              onChange={(e) => updateTrack(index, 'duration', parseInt(e.target.value) || 0)}
                              className="bg-black/50 border-gray-600 text-white w-24 hover-scale"
                            />
                            {newRelease.tracks.length > 1 && (
                              <Button
                                onClick={() => removeTrack(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 hover-scale transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleAddRelease} 
                    className="w-full bg-white text-black hover:bg-gray-200 hover-scale transition-all duration-200 text-lg py-6"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Add Release to Library
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
