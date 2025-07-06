import React, { useState, useEffect } from 'react';
import { X, Shield, Music, BarChart3, Users, Trash2, Star, Plus, Mic } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useMusic } from '../contexts/MusicContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  username: string;
  bio?: string;
  profile_picture_url?: string;
  background_image_url?: string;
  created_at: string;
  updated_at: string;
}

export const AdminPanel = () => {
  const { isAuthenticated, isAdminPanelOpen, login, logout, closeAdminPanel } = useAdmin();
  const { addRelease, releases, updateTrackLyrics } = useMusic();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('releases');
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form state for adding releases
  const [releaseForm, setReleaseForm] = useState({
    title: '',
    type: 'single' as 'single' | 'ep' | 'album',
    releaseDate: '',
    coverUrl: '',
    artist: 'Ye, Kanye West'
  });

  const [trackForms, setTrackForms] = useState([{
    title: '',
    artist: 'Ye, Kanye West',
    audioUrl: '',
    duration: 180
  }]);

  const [lyricsForm, setLyricsForm] = useState({
    trackId: '',
    lyrics: ''
  });

  useEffect(() => {
    if (isAuthenticated && activeTab === 'users') {
      fetchUsers();
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    console.log('Fetching users...');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Users fetched:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  };

  const banUser = async (userId: string, username: string) => {
    console.log('Banning user:', userId, username);
    setIsLoading(true);
    try {
      // Delete user's profile from the profiles table
      console.log('Deleting profile...');
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Profile deletion error:', profileError);
        throw profileError;
      }

      // Clean up their liked songs
      console.log('Cleaning up liked songs...');
      const { error: likedError } = await supabase
        .from('liked_songs')
        .delete()
        .eq('user_id', userId);

      if (likedError) {
        console.error('Liked songs cleanup error:', likedError);
      }

      // Clean up their playlists
      console.log('Cleaning up playlists...');
      const { error: playlistError } = await supabase
        .from('playlists')
        .delete()
        .eq('user_id', userId);

      if (playlistError) {
        console.error('Playlists cleanup error:', playlistError);
      }

      console.log('User banned successfully');
      toast({
        title: "Success",
        description: `User ${username} has been banned and their data removed`
      });

      fetchUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    if (login(password)) {
      setPassword('');
      toast({
        title: "Success",
        description: "Admin access granted"
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid password",
        variant: "destructive"
      });
    }
  };

  const handleReleaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting release:', releaseForm);
    console.log('Tracks:', trackForms);
    
    try {
      const tracksWithUrls = trackForms.filter(track => track.title && track.audioUrl);
      
      if (tracksWithUrls.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one track with title and audio URL",
          variant: "destructive"
        });
        return;
      }

      const releaseData = {
        id: '',
        title: releaseForm.title,
        type: releaseForm.type,
        coverUrl: releaseForm.coverUrl,
        releaseDate: releaseForm.releaseDate || new Date().toISOString().split('T')[0],
        tracks: tracksWithUrls.map((track, index) => ({
          id: '',
          title: track.title,
          artist: track.artist,
          audioUrl: track.audioUrl,
          coverUrl: releaseForm.coverUrl,
          duration: track.duration
        })),
        isFeatured: false
      };

      await addRelease(releaseData);
      
      // Reset forms
      setReleaseForm({
        title: '',
        type: 'single',
        releaseDate: '',
        coverUrl: '',
        artist: 'Ye, Kanye West'
      });
      setTrackForms([{
        title: '',
        artist: 'Ye, Kanye West',
        audioUrl: '',
        duration: 180
      }]);

      toast({
        title: "Success",
        description: "Release added successfully"
      });
    } catch (error) {
      console.error('Error adding release:', error);
      toast({
        title: "Error",
        description: "Failed to add release",
        variant: "destructive"
      });
    }
  };

  const handleAddTrack = () => {
    setTrackForms([...trackForms, {
      title: '',
      artist: 'Ye, Kanye West',
      audioUrl: '',
      duration: 180
    }]);
  };

  const handleTrackChange = (index: number, field: string, value: string | number) => {
    const updatedTracks = trackForms.map((track, i) => 
      i === index ? { ...track, [field]: value } : track
    );
    setTrackForms(updatedTracks);
  };

  const handleRemoveTrack = (index: number) => {
    if (trackForms.length > 1) {
      setTrackForms(trackForms.filter((_, i) => i !== index));
    }
  };

  const handleLyricsSubmit = async (trackId: string) => {
    try {
      if (!lyricsForm.lyrics.trim()) {
        toast({
          title: "Error",
          description: "Please enter lyrics",
          variant: "destructive"
        });
        return;
      }

      // Parse simple lyrics format (time:text)
      const lines = lyricsForm.lyrics.split('\n').filter(line => line.trim());
      const parsedLyrics = lines.map((line, index) => {
        const match = line.match(/^(\d+(?:\.\d+)?):(.+)$/);
        if (match) {
          const time = parseFloat(match[1]);
          const text = match[2].trim();
          return {
            time,
            words: text.split(' ').map((word, wordIndex) => ({
              word,
              start: time + (wordIndex * 0.5),
              end: time + ((wordIndex + 1) * 0.5)
            }))
          };
        } else {
          // Default timing if no time specified
          return {
            time: index * 4,
            words: line.split(' ').map((word, wordIndex) => ({
              word,
              start: (index * 4) + (wordIndex * 0.5),
              end: (index * 4) + ((wordIndex + 1) * 0.5)
            }))
          };
        }
      });

      await updateTrackLyrics(trackId, parsedLyrics);
      setLyricsForm({ trackId: '', lyrics: '' });
      
      toast({
        title: "Success",
        description: "Lyrics added successfully"
      });
    } catch (error) {
      console.error('Error adding lyrics:', error);
      toast({
        title: "Error",
        description: "Failed to add lyrics",
        variant: "destructive"
      });
    }
  };

  const deleteRelease = async (releaseId: string) => {
    try {
      const { error } = await supabase
        .from('releases')
        .delete()
        .eq('id', releaseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Release deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting release:', error);
      toast({
        title: "Error",
        description: "Failed to delete release",
        variant: "destructive"
      });
    }
  };

  if (!isAdminPanelOpen) return null;

  return (
    <div className="fixed inset-0 bg-black backdrop-blur-lg z-50 flex items-center justify-center p-2">
      <div className="bg-black rounded-lg w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-white" />
            <div>
              <h2 className="text-base font-medium text-white">
                {!isAuthenticated ? 'Admin Access' : 'Admin Panel'}
              </h2>
              <p className="text-xs text-zinc-400">Manage your music collection</p>
            </div>
          </div>
          <button 
            onClick={closeAdminPanel}
            className="text-zinc-400 hover:text-white transition-all duration-300 p-1 hover:bg-zinc-800 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-64px)]">
          {!isAuthenticated ? (
            /* Login Screen */
            <div className="flex items-center justify-center min-h-[400px] p-4">
              <div className="bg-black rounded-lg p-5 w-full max-w-sm border border-zinc-800">
                <div className="text-center mb-5">
                  <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-2 border border-zinc-700">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-medium text-white mb-1">Secure Access Required</h3>
                  <p className="text-xs text-zinc-400">Enter your admin credentials to continue</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-white mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="Enter admin password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full px-3 py-2 bg-black border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-all duration-300 hover:border-zinc-500"
                    />
                  </div>
                  <button
                    onClick={handleLogin}
                    className="w-full py-2 bg-black text-white font-medium rounded border border-zinc-700 hover:border-white transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                  >
                    <Shield className="w-3 h-3" />
                    Access Admin Panel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Admin Panel Content */
            <div className="p-3">
              {/* Navigation */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('releases')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border transition-all duration-300 ${
                    activeTab === 'releases' 
                      ? 'bg-black text-white border-white' 
                      : 'bg-black text-zinc-300 border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  <Music className="w-3 h-3" />
                  Manage Releases
                </button>
                
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border transition-all duration-300 ${
                    activeTab === 'users' 
                      ? 'bg-black text-white border-white' 
                      : 'bg-black text-zinc-300 border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  Users
                </button>

                <button
                  onClick={() => setActiveTab('add-release')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border transition-all duration-300 ${
                    activeTab === 'add-release' 
                      ? 'bg-black text-white border-white' 
                      : 'bg-black text-zinc-300 border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  Add Release
                </button>

                <div className="ml-auto">
                  <button
                    onClick={logout}
                    className="text-red-400 hover:text-red-300 font-medium transition-colors text-sm px-3 py-1.5"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Content with smooth transitions */}
              <div className="relative">
                {activeTab === 'releases' && (
                  <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-white">Music Library</h3>
                      <span className="text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded">
                        {releases.length} releases
                      </span>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto space-y-3">
                      {releases.map((release) => (
                        <div key={release.id} className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-all duration-300">
                          <div className="flex items-start gap-4">
                            <img 
                              src={release.coverUrl} 
                              alt={release.title}
                              className="w-16 h-16 rounded object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-base font-medium text-white">{release.title}</h4>
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-zinc-400 hover:text-yellow-400 cursor-pointer transition-colors" />
                                  <Trash2 
                                    className="w-4 h-4 text-zinc-400 hover:text-red-400 cursor-pointer transition-colors"
                                    onClick={() => deleteRelease(release.id)}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-zinc-400 mb-3">
                                <span className="bg-black px-2 py-1 rounded capitalize">{release.type}</span>
                                <span>{release.tracks.length} track{release.tracks.length !== 1 ? 's' : ''}</span>
                                <span>{release.releaseDate}</span>
                              </div>
                              
                              {release.tracks.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-zinc-300 mb-2">Tracks</h5>
                                  {release.tracks.map((track, index) => (
                                    <div key={track.id} className="flex items-center justify-between py-2 text-sm border-b border-zinc-800 last:border-0">
                                      <div className="flex items-center gap-3">
                                        <span className="text-zinc-500 w-4">{index + 1}</span>
                                        <div>
                                          <div className="text-white font-medium">{track.title}</div>
                                          <div className="text-zinc-400 text-xs">{track.artist}</div>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => setLyricsForm({ ...lyricsForm, trackId: track.id })}
                                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                      >
                                        <Mic className="w-3 h-3" />
                                        Add Lyrics
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Lyrics Modal */}
                    {lyricsForm.trackId && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                        <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl border border-zinc-700">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-white">Add Lyrics</h3>
                            <button
                              onClick={() => setLyricsForm({ trackId: '', lyrics: '' })}
                              className="text-zinc-400 hover:text-white"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-white mb-2">
                                Lyrics (Format: time:text or just text)
                              </label>
                              <textarea
                                value={lyricsForm.lyrics}
                                onChange={(e) => setLyricsForm({ ...lyricsForm, lyrics: e.target.value })}
                                placeholder="0:First line of lyrics&#10;4:Second line of lyrics&#10;8:Third line of lyrics"
                                className="w-full h-40 px-3 py-2 bg-black border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white resize-none"
                              />
                              <p className="text-xs text-zinc-500 mt-1">
                                Use format "seconds:lyrics" for timed lyrics, or just enter plain text
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleLyricsSubmit(lyricsForm.trackId)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                              >
                                Add Lyrics
                              </button>
                              <button
                                onClick={() => setLyricsForm({ trackId: '', lyrics: '' })}
                                className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'add-release' && (
                  <div className="animate-slide-in-right max-w-4xl mx-auto">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-medium text-white mb-2">Add New Release</h3>
                      <p className="text-sm text-zinc-400">Upload a new album, EP, or single</p>
                    </div>

                    <form onSubmit={handleReleaseSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">Release Title</label>
                            <input
                              placeholder="Enter release title..."
                              value={releaseForm.title}
                              onChange={(e) => setReleaseForm({...releaseForm, title: e.target.value})}
                              className="w-full px-3 py-2 bg-black border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-all duration-300 hover:border-zinc-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">Artist Name</label>
                            <input
                              placeholder="Ye, Kanye West"
                              value={releaseForm.artist}
                              onChange={(e) => setReleaseForm({...releaseForm, artist: e.target.value})}
                              className="w-full px-3 py-2 bg-black border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-all duration-300"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white mb-2">Release Type</label>
                            <select
                              value={releaseForm.type}
                              onChange={(e) => setReleaseForm({...releaseForm, type: e.target.value as 'single' | 'ep' | 'album'})}
                              className="w-full px-3 py-2 bg-black border border-zinc-700 rounded text-white text-sm focus:outline-none focus:border-white transition-all duration-300 hover:border-zinc-500"
                              required
                            >
                              <option value="single">Single</option>
                              <option value="ep">EP</option>
                              <option value="album">Album</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white mb-2">Cover Image URL</label>
                            <input
                              placeholder="https://example.com/cover.jpg"
                              value={releaseForm.coverUrl}
                              onChange={(e) => setReleaseForm({...releaseForm, coverUrl: e.target.value})}
                              className="w-full px-3 py-2 bg-black border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-all duration-300 hover:border-zinc-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white mb-2">Release Date (optional)</label>
                            <input
                              type="date"
                              value={releaseForm.releaseDate}
                              onChange={(e) => setReleaseForm({...releaseForm, releaseDate: e.target.value})}
                              className="w-full px-3 py-2 bg-black border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-all duration-300 hover:border-zinc-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white">Track List</h4>
                            <button
                              type="button"
                              onClick={handleAddTrack}
                              className="flex items-center gap-1 px-3 py-1 bg-zinc-900 text-white rounded border border-zinc-700 hover:border-zinc-500 transition-all text-sm"
                            >
                              <Plus className="w-3 h-3" />
                              Add Track
                            </button>
                          </div>

                          <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {trackForms.map((track, index) => (
                              <div key={index} className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-xs text-white">{index + 1}</span>
                                  {trackForms.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTrack(index)}
                                      className="ml-auto text-red-400 hover:text-red-300"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <input 
                                    placeholder="Track title" 
                                    value={track.title}
                                    onChange={(e) => handleTrackChange(index, 'title', e.target.value)}
                                    className="w-full px-2 py-1 bg-black border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-all duration-300 hover:border-zinc-500" 
                                  />
                                  
                                  <input 
                                    placeholder="Artist name" 
                                    value={track.artist}
                                    onChange={(e) => handleTrackChange(index, 'artist', e.target.value)}
                                    className="w-full px-2 py-1 bg-black border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-all duration-300 hover:border-zinc-500" 
                                  />
                                  
                                  <input 
                                    placeholder="Duration (seconds)" 
                                    type="number"
                                    value={track.duration}
                                    onChange={(e) => handleTrackChange(index, 'duration', parseInt(e.target.value) || 180)}
                                    className="w-full px-2 py-1 bg-black border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-all duration-300 hover:border-zinc-500" 
                                  />
                                  
                                  <input 
                                    placeholder="MP3 URL (required for playback)" 
                                    value={track.audioUrl}
                                    onChange={(e) => handleTrackChange(index, 'audioUrl', e.target.value)}
                                    className="w-full px-2 py-1 bg-black border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-all duration-300 hover:border-zinc-500" 
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-black text-white font-medium rounded border border-zinc-700 hover:border-white transition-all duration-300 flex items-center justify-center gap-2 text-base"
                      >
                        <Plus className="w-5 h-5" />
                        Add Release to Library
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="animate-slide-in-left">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-white">User Management</h3>
                      <button
                        onClick={fetchUsers}
                        className="px-3 py-1 bg-zinc-900 text-white rounded border border-zinc-700 hover:border-zinc-500 transition-all text-sm"
                      >
                        Refresh
                      </button>
                    </div>

                    <input
                      placeholder="Search users by username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-all duration-300 hover:border-zinc-500 mb-3"
                    />

                    <div className="space-y-2">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-7 w-7 border border-zinc-700">
                              <AvatarImage 
                                src={user.profile_picture_url || undefined} 
                                alt={user.username} 
                              />
                              <AvatarFallback className="bg-black text-white border-0 text-xs">
                                {user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium text-sm">{user.username}</p>
                              <p className="text-zinc-400 text-xs">
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => banUser(user.id, user.username)}
                            disabled={isLoading}
                            className="flex items-center gap-1 px-2 py-1 bg-red-900/20 text-red-400 rounded border border-red-800 hover:bg-red-900/30 hover:border-red-700 transition-all disabled:opacity-50 text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                            Ban User
                          </button>
                        </div>
                      ))}
                      {filteredUsers.length === 0 && (
                        <div className="text-center py-6 text-zinc-400">
                          <Users className="w-6 h-6 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No users found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
