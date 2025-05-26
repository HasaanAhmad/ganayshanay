"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSongToQueue } from "@/app/actions/GanayActions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AddSongDialogProps {
  roomId: string;
}

export function AddSongDialog({ roomId }: AddSongDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [lastAddedTime, setLastAddedTime] = useState<number>(0);
  const router = useRouter();

  function extractYoutubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const youtubeId = extractYoutubeId(youtubeUrl);
      if (!youtubeId) {
        throw new Error("Invalid YouTube URL");
      }

      const currentTime = Date.now();
      const timeSinceLastAdd = currentTime - lastAddedTime;
      
      if (timeSinceLastAdd < 5 * 60 * 1000) { // 5 minutes in milliseconds
        const remainingTime = Math.ceil((5 * 60 * 1000 - timeSinceLastAdd) / 1000);
        throw new Error(`Please wait ${remainingTime} seconds before adding another song`);
      }

      await addSongToQueue(
        roomId,
        youtubeId,
        "YouTube Video", // We'll just use a generic title since we're not fetching details
        0 // Duration will be handled by the player
      );

      setLastAddedTime(currentTime);
      setOpen(false);
      setYoutubeUrl("");
      router.refresh();
    } catch (error) {
      console.error("Failed to add song:", error);
      alert(error instanceof Error ? error.message : "Failed to add song. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Song</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border border-border">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Add Song to Queue</DialogTitle>
            <DialogDescription>
              Enter a YouTube video URL to add it to the queue. You can add a song every 5 minutes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="youtubeUrl">YouTube URL</Label>
              <Input
                id="youtubeUrl"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Song"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 