
import React, { useState, useRef } from 'react';
import { Camera, Save, User, Heart, Music } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMusic } from '../contexts/MusicContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TrackList } from '../components/TrackList';
import { useToast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { profile, user } = useAuth();
  const { releases, likedSongs } = useMusic();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
  });
  
  const profilePictureRef = useRef<HTMLInputElement>(null);
  const backgroundRef = useRef<HTMLInputElement>(null);

  const allTracks = releases.flatMap(release => release.tracks);
  const likedTracks = allTracks.filter(track => likedSongs.includes(track.id));

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${path}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('profiles')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleImageUpload = async (file: File, type: 'profile' | 'background') => {
    if (!user) return;
    
    setLoading(true);
    try {
      const imageUrl = await uploadImage(file, type);
      
      const updateField = type === 'profile' ? 'profile_picture_url' : 'background_image_url';
      
      const { error } = await supabase
        .from('profiles')
        .update({ [updateField]: imageUrl })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${type === 'profile' ? 'Profile picture' : 'Background image'} updated successfully!`
      });
      
      window.location.reload(); // Refresh to show new image
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          bio: formData.bio,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
      
      setIsEditing(false);
      window.location.reload(); // Refresh to show changes
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Image Section */}
      <div 
        className="relative h-64 bg-gradient-to-br from-purple-900 to-blue-900 bg-cover bg-center"
        style={{
          backgroundImage: profile.background_image_url 
            ? `url(${profile.background_image_url})` 
            : undefined
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <Button
          onClick={() => backgroundRef.current?.click()}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70"
          disabled={loading}
        >
          <Camera className="w-4 h-4 mr-2" />
          Change Background
        </Button>
        <input
          ref={backgroundRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file, 'background');
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-8 -mt-20 relative z-10">
        {/* Profile Header */}
        <div className="flex items-end gap-6 mb-8">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
              <AvatarImage 
                src={profile.profile_picture_url || undefined} 
                alt={profile.username} 
              />
              <AvatarFallback className="bg-purple-600 text-white text-2xl">
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            <Button
              onClick={() => profilePictureRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              <Camera className="w-4 h-4" />
            </Button>
            <input
              ref={profilePictureRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'profile');
              }}
            />
          </div>
          
          <div className="flex-1 pb-4">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="text-2xl font-bold bg-gray-800 border-gray-700 text-white"
                  placeholder="Username"
                />
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white resize-none"
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="border-gray-700 text-white hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-4xl font-bold mb-2">{profile.username}</h1>
                <p className="text-gray-400 text-lg mb-4">
                  {profile.bio || "No bio added yet"}
                </p>
                <Button onClick={() => setIsEditing(true)} variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                  Edit Profile
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Liked Songs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{likedTracks.length}</div>
              <p className="text-gray-400">songs in your collection</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-blue-500" />
                Total Tracks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{allTracks.length}</div>
              <p className="text-gray-400">tracks available</p>
            </CardContent>
          </Card>
        </div>

        {/* Liked Songs Section */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              Your Liked Songs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {likedTracks.length > 0 ? (
              <TrackList tracks={likedTracks} />
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-400">No liked songs yet</h3>
                <p className="text-gray-500">Start liking songs to see them here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
