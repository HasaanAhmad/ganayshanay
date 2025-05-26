"use client";

import { Button } from "@/components/ui/button";
import { playNextSong } from "@/app/actions/GanayActions";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface NextSongButtonProps {
  roomId: string;
}

export function NextSongButton({ roomId }: NextSongButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleNextSong() {
    setIsLoading(true);
    try {
      await playNextSong(roomId);
      router.refresh();
    } catch (error) {
      console.error("Failed to play next song:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handleNextSong}
      disabled={isLoading}
      variant="outline"
      className="border-gray-400 text-gray-300 hover:bg-gray-800"
    >
      {isLoading ? "Loading..." : "Next Song"}
    </Button>
  );
} 