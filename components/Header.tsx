import { Music } from 'lucide-react';
import React from 'react'
import { Button } from './ui/button';
import { auth, signIn, signOut } from '@/server/auth';
import Link from 'next/link';

const Header = async () => {
  const session = await auth();
  return (
    <div>
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-cyan-400" />
            <span className="text-2xl font-bold text-white">Ganayshany</span>
          </Link>
        </div>
        <div className="flex space-x-4">
          {session?.user ? (
            <>
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              {session.user.name}
            </Button>
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            </>
          ) : (
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              Sign In
            </Button>
          )}
         
          {session ? (
            <form action={async () => {
              "use server";
              await signOut();
            }}>
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                Sign Out
              </Button>
            </form>
          ) : (
            <form action={async () => {
              "use server";
              await signIn();
            }}>
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                Get Started
              </Button>
            </form>
          )}
        </div>
      </nav>
    </div>
  )
}

export default Header
