"use client";

import Image from 'next/image';
import Link from 'next/link'; // Import Link
import { useEffect, useState } from 'react';

interface BackendData {
  message: string;
}

export default function Home() {
  const [data, setData] = useState<BackendData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for access token in localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
    }

    async function fetchData() {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000");
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.statusText}`);
        }
        const result = await res.json();
        setData(result);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    }
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    // Optionally redirect to login or home page
    // router.push('/login'); 
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="absolute top-4 right-4 space-x-4">
        {isAuthenticated ? (
          <button 
            onClick={handleLogout}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
        ) : (
          <>
            <Link href="/login" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
              Register
            </Link>
          </>
        )}
      </div>

      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-12">
        <p className="text-center w-full text-2xl font-bold">
          CognitiveLabsSchool
        </p>
      </div>
      
      <div className="relative flex place-items-center mb-12 before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white/10 before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-bottom-32 after:left-1/2 after:-z-10 after:h-[180px] after:w-[240px] after:-translate-x-1/2 after:bg-gradient-conic after:from-sky-200/50 after:via-blue-200/50 after:blur-2xl after:content-[''] dark:before:bg-gradient-to-br dark:before:from-zinc-700/30 dark:before:via-transparent dark:before:opacity-10">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
          src="/next.svg" 
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-1 lg:text-left">
        {error && <p className="text-lg text-red-500">Error fetching welcome message: {error}</p>}
        {data && <p className="text-lg">Backend Message: {data.message}</p>}
        {!data && !error && <p className="text-lg">Loading welcome message...</p>}
      </div>
      
      {/* Placeholder for future content like course listings */}
      <div className="mt-10 text-center">
        <p className="text-xl">Welcome to the future of AI-powered learning!</p>
        {isAuthenticated && <p className="text-md mt-2 text-green-400">You are logged in.</p>}
        <div className="mt-8">
          <Link href="/courses" className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Browse Courses
          </Link>
          {isAuthenticated && (
            <Link href="/study-plan" className="ml-4 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
              My Study Plan
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
