
import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useMusic } from '../contexts/MusicContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2, Star } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">
            {isAuthenticated ? 'Admin Panel' : 'Admin Login'}
          </h2>
          <Button
            onClick={closeAdminPanel}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {!isAuthenticated ? (
            /* Login Form */
            <div className="max-w-md mx-auto">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Enter Admin Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Enter password..."
                    />
                  </div>
                  {loginError && (
                    <p className="text-red-400 text-sm">{loginError}</p>
                  )}
                  <Button onClick={handleLogin} className="w-full">
                    Login
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Admin Panel Content */
            <div>
              {/* Tabs */}
              <div className="flex gap-4 mb-6">
                <Button
                  onClick={() => setActiveTab('manage')}
                  variant={activeTab === 'manage' ? 'default' : 'ghost'}
                >
                  Manage Releases
                </Button>
                <Button
                  onClick={() => setActiveTab('add')}
                  variant={activeTab === 'add' ? 'default' : 'ghost'}
                >
                  Add Release
                </Button>
                <Button onClick={handleLogout} variant="destructive" className="ml-auto">
                  Logout
                </Button>
              </div>

              {activeTab === 'manage' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-4">Manage Releases ({releases.length})</h3>
                  <div className="grid gap-4">
                    {releases.map(release => (
                      <Card key={release.id} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={release.coverUrl}
                              alt={release.title}
                              className="w-16 h-16 rounded object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">{release.title}</h4>
                              <p className="text-sm text-gray-400 capitalize">{release.type} • {release.tracks.length} tracks</p>
                              <p className="text-xs text-gray-500">{release.releaseDate}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {release.isFeatured && <Badge variant="secondary">Featured</Badge>}
                              <Button
                                onClick={() => toggleFeatured(release.id)}
                                variant="ghost"
                                size="sm"
                                className="text-yellow-400 hover:text-yellow-300"
                              >
                                <Star className={`w-4 h-4 ${release.isFeatured ? 'fill-current' : ''}`} />
                              </Button>
                              <Button
                                onClick={() => deleteRelease(release.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
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
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Add New Release</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="title" className="text-gray-300">Title</Label>
                      <Input
                        id="title"
                        value={newRelease.title}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type" className="text-gray-300">Type</Label>
                      <Select value={newRelease.type} onValueChange={(value: 'single' | 'ep' | 'album') => 
                        setNewRelease(prev => ({ ...prev, type: value }))
                      }>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="ep">EP</SelectItem>
                          <SelectItem value="album">Album</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="coverUrl" className="text-gray-300">Cover Image URL</Label>
                      <Input
                        id="coverUrl"
                        type="url"
                        value={newRelease.coverUrl}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, coverUrl: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="releaseDate" className="text-gray-300">Release Date</Label>
                      <Input
                        id="releaseDate"
                        type="date"
                        value={newRelease.releaseDate}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, releaseDate: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  {/* Tracks */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-gray-300">Tracks</Label>
                      <Button onClick={addTrack} size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Track
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {newRelease.tracks.map((track, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Input
                            placeholder={`Track ${index + 1} title`}
                            value={track.title}
                            onChange={(e) => updateTrack(index, 'title', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white flex-1"
                          />
                          <Input
                            type="number"
                            placeholder="Duration (seconds)"
                            value={track.duration || ''}
                            onChange={(e) => updateTrack(index, 'duration', parseInt(e.target.value) || 0)}
                            className="bg-gray-700 border-gray-600 text-white w-32"
                          />
                          {newRelease.tracks.length > 1 && (
                            <Button
                              onClick={() => removeTrack(index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAddRelease} className="w-full">
                    Add Release
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
