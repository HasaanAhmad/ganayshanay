"use client";

import { useEffect, useRef } from "react";
import { playNextSong } from "@/app/actions/GanayActions";
import { useRouter } from "next/navigation";

// Add YouTube IFrame API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          height: string;
          width: string;
          videoId: string;
          playerVars: {
            autoplay: number;
            controls: number;
            modestbranding: number;
            rel: number;
            mute: number;
          };
          events: {
            onStateChange: (event: { data: number }) => void;
            onReady: (event: any) => void;
          };
        }
      ) => void;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  youtubeId: string;
  roomId: string;
  onStateChange?: (event: { data: number }) => void;
}

export function YouTubePlayer({ youtubeId, roomId, onStateChange }: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    let isPlayerReady = false;

    // Load the YouTube IFrame Player API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize the player when the API is ready
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          mute: 0,
        },
        events: {
          onStateChange: (event: { data: number }) => {
            // Call the provided onStateChange handler if it exists
            if (onStateChange) {
              onStateChange(event);
            }
            // Also handle the default behavior
            handlePlayerStateChange(event);
          },
          onReady: (event) => {
            isPlayerReady = true;
            // Force play when ready
            event.target.playVideo();
          },
        },
      });
    };

    // Cleanup function
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [youtubeId, onStateChange]);

  const handlePlayerStateChange = async (event: { data: number }) => {
    // When video ends (state = 0)
    if (event.data === window.YT.PlayerState.ENDED) {
      try {
        const nextSong = await playNextSong(roomId);
        if (nextSong) {
          // Force a hard refresh to ensure the new song loads
          window.location.reload();
        }
      } catch (error) {
        console.error("Failed to play next song:", error);
      }
    }
  };

  return (
    <div className="aspect-video">
      <div id="youtube-player" className="w-full h-full rounded-lg" />
    </div>
  );
} 