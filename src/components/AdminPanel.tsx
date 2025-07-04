
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
  const { addRelease, releases } = useMusic();
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
    coverUrl: ''
  });

  const [trackForm, setTrackForm] = useState({
    releaseId: '',
    title: '',
    artist: '',
    audioUrl: '',
    coverUrl: '',
    duration: 180,
    trackOrder: 1
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
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
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
    setIsLoading(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      await supabase
        .from('liked_songs')
        .delete()
        .eq('user_id', userId);

      await supabase
        .from('playlists')
        .delete()
        .eq('user_id', userId);

      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        console.log('Auth deletion failed, but profile was removed:', deleteError);
      }

      toast({
        title: "Success",
        description: `User ${username} has been banned and their account deleted`
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
    try {
      await addRelease({
        id: '',
        title: releaseForm.title,
        type: releaseForm.type,
        coverUrl: releaseForm.coverUrl,
        releaseDate: releaseForm.releaseDate,
        tracks: [],
        isFeatured: false
      });
      setReleaseForm({ title: '', type: 'single', releaseDate: '', coverUrl: '' });
      toast({
        title: "Success",
        description: "Release added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add release",
        variant: "destructive"
      });
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('tracks')
        .insert({
          release_id: trackForm.releaseId,
          title: trackForm.title,
          artist: trackForm.artist,
          audio_url: trackForm.audioUrl,
          cover_url: trackForm.coverUrl,
          duration: trackForm.duration,
          track_order: trackForm.trackOrder
        });

      if (error) throw error;

      setTrackForm({
        releaseId: '',
        title: '',
        artist: '',
        audioUrl: '',
        coverUrl: '',
        duration: 180,
        trackOrder: 1
      });
      toast({
        title: "Success",
        description: "Track added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add track",
        variant: "destructive"
      });
    }
  };

  if (!isAdminPanelOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-start justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-800 shadow-2xl mt-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-semibold text-white">
                {!isAuthenticated ? 'Admin Access' : 'Admin Panel'}
              </h2>
              <p className="text-sm text-gray-400">Manage your music collection</p>
            </div>
          </div>
          <button 
            onClick={closeAdminPanel}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          {!isAuthenticated ? (
            /* Login Screen */
            <div className="flex items-center justify-center min-h-[500px] p-8">
              <div className="bg-[#2a2a2a] rounded-xl p-8 w-full max-w-md border border-gray-700">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#3a3a3a] rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Secure Access Required</h3>
                  <p className="text-gray-400">Enter your admin credentials to continue</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Password</label>
                    <input
                      type="password"
                      placeholder="Enter admin password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                    />
                  </div>
                  <button
                    onClick={handleLogin}
                    className="w-full py-3 bg-black text-white font-medium rounded-lg border border-gray-600 hover:border-white transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Access Admin Panel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Admin Panel Content */
            <div className="p-6">
              {/* Navigation */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setActiveTab('releases')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-200 ${
                    activeTab === 'releases' 
                      ? 'bg-black text-white border-white' 
                      : 'bg-[#2a2a2a] text-gray-300 border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  Manage Releases
                </button>
                
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-200 ${
                    activeTab === 'users' 
                      ? 'bg-black text-white border-white' 
                      : 'bg-[#2a2a2a] text-gray-300 border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Users
                </button>

                <div className="ml-auto flex items-center gap-4">
                  <button
                    onClick={() => setActiveTab('add-release')}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg border border-white hover:bg-gray-900 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Release
                  </button>
                  <button
                    onClick={logout}
                    className="text-red-400 hover:text-red-300 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Content */}
              {activeTab === 'releases' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Music Library</h3>
                    <span className="text-sm text-gray-400 bg-[#2a2a2a] px-3 py-1 rounded-full">
                      {releases.length} releases
                    </span>
                  </div>
                  
                  <div className="space-y-6">
                    {releases.map((release) => (
                      <div key={release.id} className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
                        <div className="flex items-start gap-4">
                          <img 
                            src={release.coverUrl} 
                            alt={release.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-white">{release.title}</h4>
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors" />
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400 cursor-pointer transition-colors" />
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                              <span className="bg-[#1a1a1a] px-2 py-1 rounded capitalize">{release.type}</span>
                              <span>{release.tracks.length} track{release.tracks.length !== 1 ? 's' : ''}</span>
                              <span>{release.releaseDate}</span>
                            </div>
                            
                            {release.tracks.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-300 mb-2">Tracks</h5>
                                {release.tracks.map((track, index) => (
                                  <div key={track.id} className="flex items-center justify-between py-2 text-sm">
                                    <div className="flex items-center gap-3">
                                      <span className="text-gray-500 w-6">{index + 1}</span>
                                      <div>
                                        <div className="text-white font-medium">{track.title}</div>
                                        <div className="text-gray-400">{track.artist}</div>
                                      </div>
                                    </div>
                                    <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
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
                </div>
              )}

              {activeTab === 'add-release' && (
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">Add New Release</h3>
                    <p className="text-gray-400">Upload a new album, EP, or single</p>
                  </div>

                  <form onSubmit={handleReleaseSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Release Title</label>
                        <input
                          placeholder="Enter release title..."
                          value={releaseForm.title}
                          onChange={(e) => setReleaseForm({...releaseForm, title: e.target.value})}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Artist Name</label>
                        <input
                          placeholder="Kanye West"
                          value="Kanye West"
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                          readOnly
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Release Type</label>
                        <select
                          value={releaseForm.type}
                          onChange={(e) => setReleaseForm({...releaseForm, type: e.target.value as 'single' | 'ep' | 'album'})}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
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
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Release Date (optional)</label>
                        <input
                          type="text"
                          placeholder="dd/mm/yyyy"
                          value={releaseForm.releaseDate}
                          onChange={(e) => setReleaseForm({...releaseForm, releaseDate: e.target.value})}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty to use today's date</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-white">Track List</h4>
                        <button
                          type="button"
                          className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-white rounded-lg border border-gray-600 hover:border-gray-400 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Add Track
                        </button>
                      </div>

                      <div className="bg-[#2a2a2a] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center text-sm text-white">1</span>
                          <div className="grid grid-cols-3 gap-3 flex-1">
                            <input placeholder="Track 1 title" className="px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-white" />
                            <input placeholder="Kanye West" value="Kanye West" readOnly className="px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm" />
                            <input placeholder="Duration" className="px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-white" />
                          </div>
                        </div>
                        <input 
                          placeholder="MP3 URL (required for playback)" 
                          className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-white" 
                        />
                        <p className="text-xs text-gray-500 mt-2">Duration will be auto-detected from MP3 if not specified</p>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <button
                        type="submit"
                        className="w-full py-4 bg-black text-white font-semibold rounded-lg border border-white hover:bg-gray-900 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add Release to Library
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">User Management</h3>
                    <button
                      onClick={fetchUsers}
                      className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg border border-gray-600 hover:border-gray-400 transition-all"
                    >
                      Refresh
                    </button>
                  </div>

                  <input
                    placeholder="Search users by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all mb-6"
                  />

                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border border-gray-600">
                            <AvatarImage 
                              src={user.profile_picture_url || undefined} 
                              alt={user.username} 
                            />
                            <AvatarFallback className="bg-[#1a1a1a] text-white border-0">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">{user.username}</p>
                            <p className="text-gray-400 text-sm">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => banUser(user.id, user.username)}
                          disabled={isLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-red-900/20 text-red-400 rounded-lg border border-red-800 hover:bg-red-900/30 hover:border-red-700 transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Ban User
                        </button>
                      </div>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-12 text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No users found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
