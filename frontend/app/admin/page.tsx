// frontend/app/admin/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Placeholder for icons - consider using a library like Heroicons
const IconCourses = () => <svg className="w-10 h-10 text-indigo-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m0 0A8.001 8.001 0 004 12a8.001 8.001 0 008 8.247zM12 6.253c0-1.657 1.343-3 3-3s3 1.343 3 3c0 1.657-1.343 3-3 3s-3-1.343-3-3zm0 0c0-1.657-1.343-3-3-3s-3 1.343-3 3c0 1.657 1.343 3 3 3s3-1.343 3-3z"></path></svg>;
const IconUsers = () => <svg className="w-10 h-10 text-green-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
const IconEnrollments = () => <svg className="w-10 h-10 text-teal-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>;
const IconSkills = () => <svg className="w-10 h-10 text-orange-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>;
const IconAnalytics = () => <svg className="w-10 h-10 text-purple-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>;


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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Admin Navbar - could be a shared component */}
      <nav className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/admin" className="text-xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            Admin Panel
          </Link>
          <div>
            <Link href="/" className="text-gray-300 hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
              View Public Site
            </Link>
            {/* Add logout button here if needed, or keep in main site nav */}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-10">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-gray-400">Welcome, Admin! Oversee and manage the CognitiveLabsSchool platform.</p>
        </header>

        {/* Placeholder for Stats - design for future data */}
        <section className="mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat Card Example */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 uppercase">Total Users</h3>
            <p className="mt-1 text-3xl font-semibold text-green-400">1,234</p> {/* Placeholder data */}
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 uppercase">Active Courses</h3>
            <p className="mt-1 text-3xl font-semibold text-indigo-400">56</p> {/* Placeholder data */}
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 uppercase">Enrollments Today</h3>
            <p className="mt-1 text-3xl font-semibold text-teal-400">12</p> {/* Placeholder data */}
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 uppercase">Pending Approvals</h3>
            <p className="mt-1 text-3xl font-semibold text-orange-400">3</p> {/* Placeholder data */}
          </div>
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Manage Courses */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 flex flex-col items-center text-center">
            <IconCourses />
            <h2 className="text-2xl font-semibold mb-3 text-indigo-400">Manage Courses</h2>
            <p className="text-gray-400 mb-6 flex-grow">Create, edit, and organize course content including modules and lessons.</p>
            <Link href="/admin/courses" className="w-full mt-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                Go to Courses
            </Link>
          </div>

          {/* Card 2: Manage Users */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 hover:border-green-500/50 transition-all duration-300 flex flex-col items-center text-center">
            <IconUsers />
            <h2 className="text-2xl font-semibold mb-3 text-green-400">Manage Users</h2>
            <p className="text-gray-400 mb-6 flex-grow">View user profiles, manage roles, and oversee platform access.</p>
            <Link href="/admin/users" className="w-full mt-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                Go to Users
            </Link>
          </div>

          {/* Card 3: Manage Enrollments */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 hover:border-teal-500/50 transition-all duration-300 flex flex-col items-center text-center">
            <IconEnrollments />
            <h2 className="text-2xl font-semibold mb-3 text-teal-400">Manage Enrollments</h2>
            <p className="text-gray-400 mb-6 flex-grow">Track and manage student enrollments across all available courses.</p>
            <Link href="/admin/enrollments" className="w-full mt-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                View Enrollments
            </Link>
          </div>
          
          {/* Card 4: Manage Skills */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 hover:border-orange-500/50 transition-all duration-300 flex flex-col items-center text-center">
            <IconSkills />
            <h2 className="text-2xl font-semibold mb-3 text-orange-400">Manage Skills</h2>
            <p className="text-gray-400 mb-6 flex-grow">Define, update, and associate skills with educational content.</p>
            <Link href="/admin/skills" className="w-full mt-auto bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                Manage Skills
            </Link>
          </div>

          {/* Card 5: Platform Analytics */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 relative flex flex-col items-center text-center">
            <IconAnalytics />
            <h2 className="text-2xl font-semibold mb-3 text-purple-400">Platform Analytics</h2>
            <p className="text-gray-400 mb-6 flex-grow">Gain insights from platform usage, user progress, and content effectiveness.</p>
            <button 
              className="w-full mt-auto bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors opacity-60 cursor-not-allowed"
              disabled
            >
              View Analytics
            </button>
            <span className="absolute top-3 right-3 bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
              Soon
            </span>
          </div>
          
          {/* Add more cards or sections as needed */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 hover:border-pink-500/50 transition-all duration-300 flex flex-col items-center text-center md:col-span-1 lg:col-span-1">
             {/* Placeholder for another section, e.g., Site Settings or Reports */}
            <svg className="w-10 h-10 text-pink-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <h2 className="text-2xl font-semibold mb-3 text-pink-400">Site Settings</h2>
            <p className="text-gray-400 mb-6 flex-grow">Configure global platform settings and integrations.</p>
            <button className="w-full mt-auto bg-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors opacity-60 cursor-not-allowed" disabled>
              Configure
            </button>
             <span className="absolute top-3 right-3 bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
              Soon
            </span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
