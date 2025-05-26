"use server";
import { auth } from "@/server/auth";
import { prisma } from "@/server/prisma";
import { MemberRole } from "@prisma/client";

export async function createRoom(name: string, description: string, isPublic: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const room = await prisma.room.create({
    data: {
      name,
      description,
      isPublic,
      ownerId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: MemberRole.OWNER,
        },
      },
      songQueue: {
        create: {},
      },
    },
  });

  return room;
}

export async function getPublicRooms() {
  const rooms = await prisma.room.findMany({
    where: {
      isPublic: true,
    },
    include: {
      owner: {
        select: {
          name: true,
          image: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
      songQueue: {
        include: {
          songs: true,
        },
      },
    },
  });

  return rooms;
}

export async function getRoomById(roomId: string) {
  const room = await prisma.room.findUnique({
    where: {
      id: roomId,
    },
    include: {
      owner: {
        select: {
          name: true,
          image: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
      songQueue: {
        include: {
          songs: {
            include: {
              addedBy: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
      currentSong: true,
    },
  });

  if (!room) {
    throw new Error("Room not found");
  }

  return room;
}

export async function joinRoom(roomId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new Error("Room not found");
  }

  if (!room.isPublic) {
    throw new Error("Cannot join private room");
  }

  const existingMember = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId: session.user.id,
        roomId: room.id,
      },
    },
  });

  if (existingMember) {
    return existingMember;
  }

  const member = await prisma.roomMember.create({
    data: {
      userId: session.user.id,
      roomId: room.id,
      role: MemberRole.MEMBER,
    },
  });

  return member;
}

export async function getUserRooms() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const rooms = await prisma.room.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      ],
    },
    include: {
      owner: {
        select: {
          name: true,
          image: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return rooms;
}

export async function addSongToQueue(roomId: string, youtubeId: string, title: string, duration: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      songQueue: true,
    },
  });

  if (!room) {
    throw new Error("Room not found");
  }

  // Get the current highest position in the queue
  const lastSong = await prisma.queuedSong.findFirst({
    where: { queueId: room.songQueue!.id },
    orderBy: { position: 'desc' },
  });

  const newPosition = (lastSong?.position ?? -1) + 1;

  const song = await prisma.queuedSong.create({
    data: {
      youtubeId,
      title,
      duration,
      position: newPosition,
      queueId: room.songQueue!.id,
      addedById: session.user.id,
    },
  });

  return song;
}

export async function playNextSong(roomId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      songQueue: {
        include: {
          songs: {
            orderBy: { position: 'asc' },
            include: {
              addedBy: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!room) {
    throw new Error("Room not found");
  }

  // Get the next song in queue
  const nextSong = room.songQueue?.songs[0];
  if (!nextSong) {
    // If no next song, clear current song
    await prisma.room.update({
      where: { id: roomId },
      data: {
        currentSongId: null,
      },
    });
    return null;
  }

  // Update the room's current song
  const updatedRoom = await prisma.room.update({
    where: { id: roomId },
    data: {
      currentSongId: nextSong.id,
    },
  });

  // Remove the song from queue
  await prisma.queuedSong.delete({
    where: { id: nextSong.id },
  });

  return nextSong;
}

export async function getCurrentSong(roomId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      songQueue: {
        include: {
          songs: {
            include: {
              addedBy: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return room?.songQueue?.songs[0];
}