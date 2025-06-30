import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useMusic } from '../contexts/MusicContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2, Star, Shield, Music2, Upload, Music } from 'lucide-react';
import { Release, Track } from '../contexts/MusicContext';
import { LyricsEditor } from './LyricsEditor';

export const AdminPanel: React.FC = () => {
  const { isAdminPanelOpen, isAuthenticated, login, logout, closeAdminPanel } = useAdmin();
  const { releases, addRelease, deleteRelease, toggleFeatured, getAudioDuration } = useMusic();
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'manage' | 'add'>('login');
  const [lyricsEditor, setLyricsEditor] = useState<{ isOpen: boolean; track: Track | null }>({
    isOpen: false,
    track: null
  });

  // Form state for adding releases
  const [newRelease, setNewRelease] = useState({
    title: '',
    type: 'single' as 'single' | 'ep' | 'album',
    coverUrl: '',
    releaseDate: '',
    artist: 'Kanye West',
    tracks: [{ title: '', duration: 0, audioUrl: '', artist: 'Kanye West' }]
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

  const handleAddRelease = async () => {
    if (!newRelease.title || !newRelease.coverUrl) {
      return;
    }

    // Auto-set release date if not provided
    const releaseDate = newRelease.releaseDate || new Date().toISOString().split('T')[0];

    // Process tracks and get durations
    const processedTracks = await Promise.all(
      newRelease.tracks.map(async (track, index) => {
        let duration = track.duration;
        
        // Auto-get duration from MP3 if not provided and audioUrl exists
        if (!duration && track.audioUrl) {
          try {
            duration = await getAudioDuration(track.audioUrl);
          } catch (error) {
            duration = 180; // Default fallback
          }
        } else if (!duration) {
          duration = 180; // Default fallback
        }

        return {
          id: `${Date.now()}-${index}`,
          title: track.title || `Track ${index + 1}`,
          artist: track.artist || newRelease.artist,
          audioUrl: track.audioUrl || '',
          coverUrl: newRelease.coverUrl,
          duration
        };
      })
    );

    const release: Release = {
      id: Date.now().toString(),
      title: newRelease.title,
      type: newRelease.type,
      coverUrl: newRelease.coverUrl,
      releaseDate,
      isFeatured: false,
      tracks: processedTracks
    };

    addRelease(release);
    setNewRelease({
      title: '',
      type: 'single',
      coverUrl: '',
      releaseDate: '',
      artist: 'Kanye West',
      tracks: [{ title: '', duration: 0, audioUrl: '', artist: 'Kanye West' }]
    });
    setActiveTab('manage');
  };

  const addTrack = () => {
    setNewRelease(prev => ({
      ...prev,
      tracks: [...prev.tracks, { title: '', duration: 0, audioUrl: '', artist: prev.artist }]
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

  const openLyricsEditor = (track: Track) => {
    setLyricsEditor({ isOpen: true, track });
  };

  const closeLyricsEditor = () => {
    setLyricsEditor({ isOpen: false, track: null });
  };

  if (!isAdminPanelOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="modern-card bg-black border border-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-black">
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
                    <Button onClick={handleLogin} className="w-full bg-black text-white border border-white hover:bg-white hover:text-black hover-scale transition-all duration-200">
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
                    className={`flex-1 hover-scale transition-all duration-200 ${
                      activeTab === 'manage' 
                        ? 'bg-black text-white border border-white shadow-lg' 
                        : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <Music2 className="w-4 h-4 mr-2" />
                    Manage Releases
                  </Button>
                  <Button
                    onClick={() => setActiveTab('add')}
                    className={`flex-1 hover-scale transition-all duration-200 ${
                      activeTab === 'add' 
                        ? 'bg-black text-white border border-white shadow-lg' 
                        : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Release
                  </Button>
                  <Button 
                    onClick={handleLogout} 
                    className="bg-transparent text-red-400 hover:text-red-300 hover:bg-red-500/10 hover-scale transition-all duration-200 border border-transparent"
                  >
                    Logout
                  </Button>
                </div>

                {activeTab === 'manage' && (
                  <div className="space-y-6 animate-slide-in-right">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-white">Music Library</h3>
                      <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
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
                            <div className="flex items-center gap-6 mb-4">
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
                                <p className="text-gray-400 text-sm">{release.releaseDate}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => toggleFeatured(release.id)}
                                  className={`hover-scale transition-all duration-200 ${
                                    release.isFeatured 
                                      ? 'bg-yellow-500/20 text-yellow-400 hover:text-yellow-300 border border-yellow-500/30' 
                                      : 'bg-transparent text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 border border-transparent'
                                  }`}
                                  size="sm"
                                >
                                  <Star className={`w-5 h-5 ${release.isFeatured ? 'fill-current' : ''}`} />
                                </Button>
                                <Button
                                  onClick={() => deleteRelease(release.id)}
                                  className="bg-transparent text-red-400 hover:text-red-300 hover:bg-red-500/10 hover-scale transition-all duration-200 border border-transparent"
                                  size="sm"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </Button>
                              </div>
                            </div>

                            {/* Track List with Lyrics Buttons */}
                            <div className="space-y-2 pt-4 border-t border-gray-700">
                              <h5 className="text-sm font-medium text-gray-300 mb-3">Tracks</h5>
                              {release.tracks.map((track, trackIndex) => (
                                <div key={track.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-gray-700/50">
                                  <div className="flex items-center gap-3">
                                    <span className="text-gray-400 text-sm w-6">{trackIndex + 1}</span>
                                    <div>
                                      <p className="text-white font-medium text-sm">{track.title}</p>
                                      <p className="text-gray-400 text-xs">{track.artist}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {track.lyrics && track.lyrics.length > 0 && (
                                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                        Has Lyrics
                                      </Badge>
                                    )}
                                    <Button
                                      onClick={() => openLyricsEditor(track)}
                                      size="sm"
                                      className="bg-blue-600/20 text-blue-400 hover:text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 hover-scale transition-all duration-200"
                                    >
                                      <Music className="w-4 h-4 mr-1" />
                                      {track.lyrics && track.lyrics.length > 0 ? 'Edit Lyrics' : 'Add Lyrics'}
                                    </Button>
                                  </div>
                                </div>
                              ))}
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
                          <Label htmlFor="artist" className="text-gray-300 font-medium">Artist Name</Label>
                          <Input
                            id="artist"
                            value={newRelease.artist}
                            onChange={(e) => setNewRelease(prev => ({ ...prev, artist: e.target.value }))}
                            className="bg-black/50 border-gray-600 text-white focus:border-white/50 focus:ring-white/20 hover-scale"
                            placeholder="Enter artist name..."
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
                            <SelectContent className="bg-black border-gray-700">
                              <SelectItem value="single" className="text-white hover:bg-gray-800 focus:bg-gray-800">Single</SelectItem>
                              <SelectItem value="ep" className="text-white hover:bg-gray-800 focus:bg-gray-800">EP</SelectItem>
                              <SelectItem value="album" className="text-white hover:bg-gray-800 focus:bg-gray-800">Album</SelectItem>
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
                          <Label htmlFor="releaseDate" className="text-gray-300 font-medium">Release Date (optional)</Label>
                          <Input
                            id="releaseDate"
                            type="date"
                            value={newRelease.releaseDate}
                            onChange={(e) => setNewRelease(prev => ({ ...prev, releaseDate: e.target.value }))}
                            className="bg-black/50 border-gray-600 text-white focus:border-white/50 focus:ring-white/20 hover-scale"
                          />
                          <p className="text-xs text-gray-500">Leave empty to use today's date</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-300 font-medium">Track List</Label>
                          <Button 
                            onClick={addTrack} 
                            size="sm" 
                            className="bg-transparent border border-gray-600 text-gray-300 hover:text-white hover:bg-white/10 hover-scale transition-all duration-200"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Track
                          </Button>
                        </div>
                        
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                          {newRelease.tracks.map((track, index) => (
                            <div 
                              key={index} 
                              className="space-y-3 p-4 bg-gray-900/30 rounded-lg border border-gray-700 animate-fade-in"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-gray-400 text-sm font-medium w-8">{index + 1}</span>
                                <Input
                                  placeholder={`Track ${index + 1} title`}
                                  value={track.title}
                                  onChange={(e) => updateTrack(index, 'title', e.target.value)}
                                  className="bg-black/50 border-gray-600 text-white flex-1 hover-scale"
                                />
                                <Input
                                  placeholder="Artist"
                                  value={track.artist}
                                  onChange={(e) => updateTrack(index, 'artist', e.target.value)}
                                  className="bg-black/50 border-gray-600 text-white w-32 hover-scale"
                                />
                                <Input
                                  type="number"
                                  placeholder="Duration (s)"
                                  value={track.duration || ''}
                                  onChange={(e) => updateTrack(index, 'duration', parseInt(e.target.value) || 0)}
                                  className="bg-black/50 border-gray-600 text-white w-24 hover-scale"
                                />
                                {newRelease.tracks.length > 1 && (
                                  <Button
                                    onClick={() => removeTrack(index)}
                                    className="bg-transparent text-red-400 hover:text-red-300 hover:bg-red-500/10 hover-scale transition-all duration-200 border border-transparent"
                                    size="sm"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                              <Input
                                placeholder="MP3 URL (required for playback)"
                                value={track.audioUrl}
                                onChange={(e) => updateTrack(index, 'audioUrl', e.target.value)}
                                className="bg-black/50 border-gray-600 text-white hover-scale"
                              />
                              <p className="text-xs text-gray-500">Duration will be auto-detected from MP3 if not specified</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleAddRelease} 
                      className="w-full bg-black text-white border border-white hover:bg-white hover:text-black hover-scale transition-all duration-200 text-lg py-6"
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

      {/* Lyrics Editor Modal */}
      {lyricsEditor.track && (
        <LyricsEditor
          track={lyricsEditor.track}
          isOpen={lyricsEditor.isOpen}
          onClose={closeLyricsEditor}
        />
      )}
    </>
  );
};
