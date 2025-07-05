
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
        const rpc = new window.DiscordSDK.RPC.register('your-discord-app-id');
        
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
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [currentTrack, isPlaying]);
};
