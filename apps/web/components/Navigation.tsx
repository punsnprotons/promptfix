'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FlaskConical } from 'lucide-react'

export function Navigation() {
  const { data: session, status } = useSession()

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
              <FlaskConical className="h-6 w-6 text-orange-500" />
              <span><span className="text-orange-500">Prompt</span>Fix</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="text-gray-400">Loading...</div>
            ) : session ? (
              <>
                <span className="text-gray-300">Welcome, {session.user?.name || session.user?.email}</span>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  size="sm" 
                  className="bg-orange-500 hover:bg-orange-600 text-black"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-black">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
