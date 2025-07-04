
import React, { useState, useEffect } from 'react';
import { X, Shield, ShieldCheck, Music, BarChart3, Users, Trash2 } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useMusic } from '../contexts/MusicContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      // Delete the user's profile and all associated data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Delete user's liked songs
      await supabase
        .from('liked_songs')
        .delete()
        .eq('user_id', userId);

      // Delete user's playlists
      await supabase
        .from('playlists')
        .delete()
        .eq('user_id', userId);

      // Delete the user from auth (this will cascade to other tables)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        console.log('Auth deletion failed, but profile was removed:', deleteError);
      }

      toast({
        title: "Success",
        description: `User ${username} has been banned and their account deleted`
      });

      // Refresh the users list
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
      // Since addTrack doesn't exist in MusicContext, we'll add tracks directly to the database
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
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-black rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border border-white/10 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between p-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-white" />
            <h2 className="text-2xl font-bold text-white tracking-wide">Admin Control</h2>
          </div>
          <button 
            onClick={closeAdminPanel}
            className="text-white/70 hover:text-white transition-all duration-300 hover:rotate-90 p-2 rounded-full hover:bg-white/5"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(95vh-100px)]">
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-soft">
                  <ShieldCheck className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3 tracking-wide">Access Control</h3>
                <p className="text-white/60 text-lg">Enter admin credentials to continue</p>
              </div>
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Admin Password"  
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 text-lg"
                  />
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full py-4 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 text-lg tracking-wide"
                >
                  Authenticate
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="mb-8">
                <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
                  {[
                    { id: 'releases', icon: Music, label: 'Releases' },
                    { id: 'tracks', icon: BarChart3, label: 'Tracks' },
                    { id: 'users', icon: Users, label: 'Users' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-white text-black shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="text-lg">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'releases' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-6 tracking-wide">Create New Release</h3>
                    <form onSubmit={handleReleaseSubmit} className="space-y-6">
                      <input
                        placeholder="Release Title"
                        value={releaseForm.title}
                        onChange={(e) => setReleaseForm({...releaseForm, title: e.target.value})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                        required
                      />
                      <select
                        value={releaseForm.type}
                        onChange={(e) => setReleaseForm({...releaseForm, type: e.target.value as 'single' | 'ep' | 'album'})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                        required
                      >
                        <option value="single" className="bg-black">Single</option>
                        <option value="ep" className="bg-black">EP</option>
                        <option value="album" className="bg-black">Album</option>
                      </select>
                      <input
                        type="date"
                        value={releaseForm.releaseDate}
                        onChange={(e) => setReleaseForm({...releaseForm, releaseDate: e.target.value})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                        required
                      />
                      <input
                        placeholder="Cover Image URL"
                        value={releaseForm.coverUrl}
                        onChange={(e) => setReleaseForm({...releaseForm, coverUrl: e.target.value})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-4 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 tracking-wide"
                      >
                        Create Release
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'tracks' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-6 tracking-wide">Add New Track</h3>
                    <form onSubmit={handleTrackSubmit} className="space-y-6">
                      <select
                        value={trackForm.releaseId}
                        onChange={(e) => setTrackForm({...trackForm, releaseId: e.target.value})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                        required
                      >
                        <option value="" className="bg-black">Select Release</option>
                        {releases.map(release => (
                          <option key={release.id} value={release.id} className="bg-black">{release.title}</option>
                        ))}
                      </select>
                      <input
                        placeholder="Track Title"
                        value={trackForm.title}
                        onChange={(e) => setTrackForm({...trackForm, title: e.target.value})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                        required
                      />
                      <input
                        placeholder="Artist"
                        value={trackForm.artist}
                        onChange={(e) => setTrackForm({...trackForm, artist: e.target.value})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                        required
                      />
                      <input
                        placeholder="Audio URL"
                        value={trackForm.audioUrl}
                        onChange={(e) => setTrackForm({...trackForm, audioUrl: e.target.value})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                        required
                      />
                      <input
                        placeholder="Cover Image URL"
                        value={trackForm.coverUrl}
                        onChange={(e) => setTrackForm({...trackForm, coverUrl: e.target.value})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          placeholder="Duration (seconds)"
                          value={trackForm.duration}
                          onChange={(e) => setTrackForm({...trackForm, duration: parseInt(e.target.value)})}
                          className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Track Order"
                          value={trackForm.trackOrder}
                          onChange={(e) => setTrackForm({...trackForm, trackOrder: parseInt(e.target.value)})}
                          className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-4 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 tracking-wide"
                      >
                        Add Track
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white tracking-wide">User Management</h3>
                      <button
                        onClick={fetchUsers}
                        className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20"
                      >
                        Refresh
                      </button>
                    </div>
                    <input
                      placeholder="Search users by username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 mb-6"
                    />
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border border-white/20">
                              <AvatarImage 
                                src={user.profile_picture_url || undefined} 
                                alt={user.username} 
                              />
                              <AvatarFallback className="bg-white/10 text-white border-0">
                                {user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium text-lg">{user.username}</p>
                              <p className="text-white/60">
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => banUser(user.id, user.username)}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 font-medium rounded-xl border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50 hover:text-red-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Ban User
                          </button>
                        </div>
                      ))}
                      {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-white/40">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                          <p className="text-lg">No users found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {isAuthenticated && (
            <div className="flex justify-end mt-8 pt-8 border-t border-white/10">
              <button
                onClick={logout}
                className="px-8 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 tracking-wide"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
