"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RoomStateProviderProps {
  roomId: string;
  children: React.ReactNode;
}

export function RoomStateProvider({ roomId, children }: RoomStateProviderProps) {
  const router = useRouter();

  useEffect(() => {
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [roomId, router]);

  return <>{children}</>;
} 