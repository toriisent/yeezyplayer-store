
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ArrowLeft, User } from 'lucide-react';
import { TrackList } from '../components/TrackList';
import { useMusic } from '../contexts/MusicContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface Profile {
  id: string;
  username: string;
  bio?: string;
  profile_picture_url?: string;
  background_image_url?: string;
  created_at: string;
  updated_at: string;
}

const UserLikedSongs: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { releases } = useMusic();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [likedSongs, setLikedSongs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return;
      
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user's liked songs
        const { data: likedData, error: likedError } = await supabase
          .from('liked_songs')
          .select('track_id')
          .eq('user_id', profileData.id);

        if (likedError) throw likedError;
        setLikedSongs(likedData.map(item => item.track_id));
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-400">User not found</div>
      </div>
    );
  }

  const allTracks = releases.flatMap(release => release.tracks);
  const likedTracks = allTracks.filter(track => likedSongs.includes(track.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/profile/${username}`}>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-6 mb-8">
          <Avatar className="w-20 h-20">
            <AvatarImage 
              src={profile.profile_picture_url || undefined} 
              alt={profile.username} 
            />
            <AvatarFallback className="bg-purple-600 text-white text-xl">
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 to-pink-600 bg-clip-text text-transparent">
              {profile.username}'s Liked Songs
            </h1>
            <p className="text-gray-400">{likedTracks.length} liked songs</p>
          </div>
        </div>

        {likedTracks.length > 0 ? (
          <div className="animate-slide-in-right">
            <TrackList tracks={likedTracks} />
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-gray-400">No liked songs yet</h2>
            <p className="text-gray-500">{profile.username} hasn't liked any songs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLikedSongs;
