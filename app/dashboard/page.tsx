import { Button } from "@/components/ui/button"
import { auth } from "@/server/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getPublicRooms, getUserRooms } from "../actions/GanayActions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateRoomDialog } from "@/components/CreateRoomDialog"

const DashboardPage = async () => {
    const session = await auth()
    
    if(!session?.user) {
        redirect("/")
    }

    const [publicRooms, userRooms] = await Promise.all([
        getPublicRooms(),
        getUserRooms()
    ])

    return (
        <div className="container mx-auto px-6 py-20">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-white">Dashboard</h1>
                <CreateRoomDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userRooms.length > 0 && (
                    <div className="col-span-full">
                        <h2 className="text-2xl font-semibold text-white mb-4">Your Rooms</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userRooms.map((room) => (
                                <Card key={room.id} className="bg-gray-800 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-white">{room.name}</CardTitle>
                                        <CardDescription className="text-gray-400">
                                            {room.description || "No description"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-300">
                                            Members: {room.members.length}
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild className="w-full">
                                            <Link href={`/room/${room.id}`}>Join Room</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                <div className="col-span-full">
                    <h2 className="text-2xl font-semibold text-white mb-4">Public Rooms</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {publicRooms.map((room) => (
                            <Card key={room.id} className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-white">{room.name}</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        {room.description || "No description"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-300">
                                        Members: {room.members.length}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link href={`/room/${room.id}`}>Join Room</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
