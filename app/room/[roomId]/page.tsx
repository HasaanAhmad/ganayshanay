import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import { getCurrentSong, getRoomById, joinRoom } from '@/app/actions/GanayActions';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddSongDialog } from '@/components/AddSongDialog';
import { notFound } from 'next/navigation';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { NextSongButton } from '@/components/NextSongButton';
import { RoomStateProvider } from '@/components/RoomStateProvider';

export const runtime = "nodejs"

const RoomPage = async ({ params }: { params: Promise<{ roomId: string }> }) => {
    const { roomId } = await params;
    const session = await auth();
    if (!session?.user) {
        redirect("/");
    }

    try {
        const room = await getRoomById(roomId);
        const currentSong = await getCurrentSong(roomId);
        
        try {
            await joinRoom(roomId);
        } catch (error) {
            // Ignore if already a member
            console.log("Already a member or cannot join");
        }

        return (
            <RoomStateProvider roomId={roomId}>
                <div className="container mx-auto px-6 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-white">{room.name}</h1>
                            <p className="text-gray-400 mt-2">{room.description}</p>
                        </div>
                        <div className="flex gap-4">
                            <NextSongButton roomId={room.id} />
                            <AddSongDialog roomId={room.id} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* YouTube Player */}
                        <div className="lg:col-span-2">
                            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-white">Now Playing</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {currentSong ? (
                                        <div className="space-y-4">
                                            <YouTubePlayer 
                                                youtubeId={currentSong.youtubeId} 
                                                roomId={room.id}
                                            />
                                            <div className="text-white">
                                                <p className="font-medium">{currentSong.title}</p>
                                                <p className="text-sm text-gray-400">
                                                    Added by {currentSong.addedBy.name}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-gray-700/50 rounded-lg flex items-center justify-center">
                                            <p className="text-gray-400">No song is currently playing</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Queue */}
                        <div>
                            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-white">Queue</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {room.songQueue?.songs.slice(1).map((song, index) => (
                                            <div
                                                key={song.id}
                                                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-gray-400">{index + 1}</span>
                                                    <div>
                                                        <p className="font-medium text-white">{song.title}</p>
                                                        <p className="text-sm text-gray-400">
                                                            Added by {song.addedBy.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!room.songQueue?.songs || room.songQueue.songs.length <= 1) && (
                                            <p className="text-gray-400 text-center py-4">
                                                No songs in queue
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </RoomStateProvider>
        );
    } catch (error) {
        console.error("Failed to load room:", error);
        notFound();
    }
};

export default RoomPage;
