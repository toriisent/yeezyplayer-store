
import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Camera, User, Heart, Edit3, ChevronDown } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Profile {
  id: string;
  username: string;
  bio?: string;
  profile_picture_url?: string;
  background_image_url?: string;
  created_at: string;
  updated_at: string;
}

const Profile: React.FC = () => {
  const { username: urlUsername } = useParams<{ username: string }>();
  const { profile: currentUserProfile, user } = useAuth();
  const { releases } = useMusic();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [likedSongs, setLikedSongs] = useState<string[]>([]);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bioText, setBioText] = useState('');
  
  const profilePictureRef = useRef<HTMLInputElement>(null);
  const backgroundRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = !urlUsername || (currentUserProfile && urlUsername === currentUserProfile.username);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (isOwnProfile && currentUserProfile) {
        setProfile(currentUserProfile);
        setBioText(currentUserProfile.bio || '');
        // Fetch own liked songs
        try {
          const { data: likedData } = await supabase
            .from('liked_songs')
            .select('track_id')
            .eq('user_id', currentUserProfile.id);
          
          if (likedData) {
            setLikedSongs(likedData.map(item => item.track_id));
          }
        } catch (error) {
          console.error('Error fetching liked songs:', error);
        }
      } else if (urlUsername) {
        // Fetch other user's profile
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', urlUsername)
            .single();

          if (profileError) throw profileError;
          setProfile(profileData);
          setBioText(profileData.bio || '');

          // Fetch their liked songs
          const { data: likedData, error: likedError } = await supabase
            .from('liked_songs')
            .select('track_id')
            .eq('user_id', profileData.id);

          if (likedError) throw likedError;
          setLikedSongs(likedData.map(item => item.track_id));
        } catch (error) {
          console.error('Error fetching profile:', error);
          navigate('/');
        }
      }
    };

    fetchProfileData();
  }, [urlUsername, currentUserProfile, isOwnProfile, navigate]);

  const allTracks = releases.flatMap(release => release.tracks);
  const likedTracks = allTracks.filter(track => likedSongs.includes(track.id));

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
    if (!user || !isOwnProfile) return;
    
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
      
      window.location.reload();
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

  const validateBio = (bio: string): boolean => {
    // Check if bio contains URLs
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([^\s]+\.[a-zA-Z]{2,})/g;
    return !urlRegex.test(bio);
  };

  const handleBioSave = async () => {
    if (!user || !isOwnProfile) return;
    
    if (!validateBio(bioText)) {
      toast({
        title: "Error",
        description: "Bio cannot contain links or URLs.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: bioText })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bio updated successfully!"
      });
      
      setIsEditingBio(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating bio:', error);
      toast({
        title: "Error",
        description: "Failed to update bio. Please try again.",
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
        {isOwnProfile && (
          <Button
            onClick={() => backgroundRef.current?.click()}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70"
            disabled={loading}
          >
            <Camera className="w-4 h-4 mr-2" />
            Change Background
          </Button>
        )}
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
            {isOwnProfile && (
              <Button
                onClick={() => profilePictureRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                <Camera className="w-4 h-4" />
              </Button>
            )}
            <input
              ref={profilePictureRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && isOwnProfile) handleImageUpload(file, 'profile');
              }}
            />
          </div>
          
          <div className="flex-1 pb-4">
            <h1 className="text-4xl font-bold mb-2">{profile.username}</h1>
            
            {isEditingBio ? (
              <div className="space-y-4">
                <Textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white resize-none"
                  placeholder="Tell us about yourself... (No links allowed)"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={handleBioSave} disabled={loading}>
                    Save Bio
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditingBio(false)}
                    className="border-gray-700 text-white hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-400 text-lg mb-4">
                  {profile.bio || "No bio added yet"}
                </p>
                {isOwnProfile && (
                  <Button 
                    onClick={() => setIsEditingBio(true)} 
                    className="bg-black text-white border border-gray-700 hover:bg-gray-900"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Bio
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Liked Songs Section */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                {isOwnProfile ? 'Your Liked Songs' : `${profile.username}'s Liked Songs`}
              </div>
              {likedTracks.length > 3 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      className="bg-black text-white border border-gray-600 hover:bg-gray-900" 
                      size="sm"
                    >
                      <ChevronDown className="w-4 h-4 mr-2" />
                      View All ({likedTracks.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem asChild className="text-white hover:bg-gray-700">
                      <Link to={`/profile/${profile.username}/likedsongs`}>
                        View All Liked Songs
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {likedTracks.length > 0 ? (
              <TrackList tracks={likedTracks.slice(0, 3)} />
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-400">No liked songs yet</h3>
                <p className="text-gray-500">
                  {isOwnProfile ? 'Start liking songs to see them here' : `${profile.username} hasn't liked any songs yet`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
