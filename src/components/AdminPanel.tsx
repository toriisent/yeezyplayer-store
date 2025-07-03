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
  const { addRelease, addTrack, releases } = useMusic();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('releases');
  const [users, setUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form state for adding releases
  const [releaseForm, setReleaseForm] = useState({
    title: '',
    type: 'Single',
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
        title: releaseForm.title,
        type: releaseForm.type,
        release_date: releaseForm.releaseDate,
        cover_url: releaseForm.coverUrl,
        is_featured: false
      });
      setReleaseForm({ title: '', type: 'Single', releaseDate: '', coverUrl: '' });
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
      await addTrack({
        release_id: trackForm.releaseId,
        title: trackForm.title,
        artist: trackForm.artist,
        audio_url: trackForm.audioUrl,
        cover_url: trackForm.coverUrl,
        duration: trackForm.duration,
        track_order: trackForm.trackOrder
      });
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

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdminPanelOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          </div>
          <Button onClick={closeAdminPanel} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <ShieldCheck className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Admin Authentication</h3>
                <p className="text-gray-400">Enter the admin password to continue</p>
              </div>
              <div className="space-y-4">
                <Input
                  type="password"
                  placeholder="Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button onClick={handleLogin} className="w-full">
                  Login
                </Button>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="releases" className="data-[state=active]:bg-purple-600">
                  <Music className="w-4 h-4 mr-2" />
                  Releases
                </TabsTrigger>
                <TabsTrigger value="tracks" className="data-[state=active]:bg-purple-600">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Tracks
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-purple-600">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </TabsTrigger>
              </TabsList>

              <TabsContent value="releases" className="space-y-6">
                {/* Form for adding releases */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Add New Release</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleReleaseSubmit} className="space-y-4">
                      <Input
                        placeholder="Release Title"
                        value={releaseForm.title}
                        onChange={(e) => setReleaseForm({...releaseForm, title: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                      <select
                        value={releaseForm.type}
                        onChange={(e) => setReleaseForm({...releaseForm, type: e.target.value})}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                        required
                      >
                        <option value="Single">Single</option>
                        <option value="EP">EP</option>
                        <option value="Album">Album</option>
                      </select>
                      <Input
                        type="date"
                        value={releaseForm.releaseDate}
                        onChange={(e) => setReleaseForm({...releaseForm, releaseDate: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                      <Input
                        placeholder="Cover Image URL"
                        value={releaseForm.coverUrl}
                        onChange={(e) => setReleaseForm({...releaseForm, coverUrl: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                      <Button type="submit" className="w-full">Add Release</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tracks" className="space-y-6">
                {/* Form for adding tracks */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Add New Track</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleTrackSubmit} className="space-y-4">
                      <select
                        value={trackForm.releaseId}
                        onChange={(e) => setTrackForm({...trackForm, releaseId: e.target.value})}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                        required
                      >
                        <option value="">Select Release</option>
                        {releases.map(release => (
                          <option key={release.id} value={release.id}>{release.title}</option>
                        ))}
                      </select>
                      <Input
                        placeholder="Track Title"
                        value={trackForm.title}
                        onChange={(e) => setTrackForm({...trackForm, title: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                      <Input
                        placeholder="Artist"
                        value={trackForm.artist}
                        onChange={(e) => setTrackForm({...trackForm, artist: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                      <Input
                        placeholder="Audio URL"
                        value={trackForm.audioUrl}
                        onChange={(e) => setTrackForm({...trackForm, audioUrl: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                      <Input
                        placeholder="Cover Image URL"
                        value={trackForm.coverUrl}
                        onChange={(e) => setTrackForm({...trackForm, coverUrl: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                      <Input
                        type="number"
                        placeholder="Duration (seconds)"
                        value={trackForm.duration}
                        onChange={(e) => setTrackForm({...trackForm, duration: parseInt(e.target.value)})}
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                      <Input
                        type="number"
                        placeholder="Track Order"
                        value={trackForm.trackOrder}
                        onChange={(e) => setTrackForm({...trackForm, trackOrder: parseInt(e.target.value)})}
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                      <Button type="submit" className="w-full">Add Track</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      User Management
                      <Button onClick={fetchUsers} variant="outline" size="sm">
                        Refresh
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="Search users by username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white mb-4"
                    />
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage 
                                src={user.profile_picture_url || undefined} 
                                alt={user.username} 
                              />
                              <AvatarFallback className="bg-purple-600 text-white">
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
                          <Button
                            onClick={() => banUser(user.id, user.username)}
                            disabled={isLoading}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Ban User
                          </Button>
                        </div>
                      ))}
                      {filteredUsers.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          No users found
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {isAuthenticated && (
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-700">
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
