// frontend/app/admin/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link

const AdminDashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const adminStatus = localStorage.getItem('is_admin');

    if (!token) {
      router.push('/login');
    } else {
      if (adminStatus === 'true') {
        setIsAdmin(true);
      } else {
        // If not admin, redirect to home or a 'not authorized' page
        // For now, redirecting to home
        router.push('/');
      }
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (!isAdmin) {
    // This case should ideally be handled by the redirect,
    // but as a fallback or if redirection is slow.
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
        <p className="text-xl text-red-500">Access Denied.</p>
        <p className="text-gray-300">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-indigo-400">Admin Dashboard</h1>
        <p className="mb-8 text-lg text-gray-300 text-center">Welcome! Manage courses, users, skills, and more.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Manage Courses */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl hover:shadow-indigo-500/30 transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-3 text-indigo-400">Manage Courses</h2>
            <p className="text-gray-400 mb-4">Create, edit, and organize course content including modules and lessons.</p>
            <Link href="/admin/courses">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                Go to Courses
              </button>
            </Link>
          </div>

          {/* Card 2: Manage Users */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl hover:shadow-green-500/30 transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-3 text-green-400">Manage Users</h2>
            <p className="text-gray-400 mb-4">View user profiles, manage roles, and oversee platform access.</p>
            <Link href="/admin/users">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                Go to Users
              </button>
            </Link>
          </div>

          {/* Card 3: Manage Enrollments */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl hover:shadow-teal-500/30 transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-3 text-teal-400">Manage Enrollments</h2>
            <p className="text-gray-400 mb-4">Track and manage student enrollments across all available courses.</p>
            <Link href="/admin/enrollments">
              <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                View Enrollments
              </button>
            </Link>
          </div>
          
          {/* Card 4: Manage Skills */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl hover:shadow-orange-500/30 transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-3 text-orange-400">Manage Skills</h2>
            <p className="text-gray-400 mb-4">Define, update, and associate skills with educational content.</p>
            <Link href="/admin/skills">
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                Manage Skills
              </button>
            </Link>
          </div>

          {/* Card 5: Platform Analytics */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl relative">
            <h2 className="text-2xl font-semibold mb-3 text-purple-400">Platform Analytics</h2>
            <p className="text-gray-400 mb-4">Gain insights from platform usage, user progress, and content effectiveness.</p>
            <button 
              className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded transition-colors opacity-50 cursor-not-allowed"
              disabled
            >
              View Analytics
            </button>
            <span className="absolute top-2 right-2 bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
