
import { useEffect } from 'react';
import { useMusic } from '../contexts/MusicContext';

declare global {
  interface Window {
    DiscordSDK?: any;
  }
}

export const useDiscordRPC = () => {
  const { currentTrack, isPlaying } = useMusic();

  useEffect(() => {
    // Load Discord SDK
    const script = document.createElement('script');
    script.src = 'https://discord.com/api/rpc.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.DiscordSDK) {
        try {
          const rpc = new window.DiscordSDK.RPC.register('1390869946900152430');
          
          const updateActivity = () => {
            if (currentTrack && isPlaying) {
              rpc.setActivity({
                details: `Listening to ${currentTrack.title}`,
                state: `by ${currentTrack.artist}`,
                startTimestamp: Date.now(),
                largeImageKey: 'music-icon',
                largeImageText: 'Listening to music',
                smallImageKey: 'play-icon',
                smallImageText: 'Playing'
              });
            } else {
              rpc.clearActivity();
            }
          };

          updateActivity();
        } catch (error) {
          console.log('Discord RPC not available or user not connected to Discord');
        }
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [currentTrack, isPlaying]);
};
