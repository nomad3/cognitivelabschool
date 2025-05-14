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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    // This case should ideally be handled by the redirect,
    // but as a fallback or if redirection is slow.
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-xl text-red-500">Access Denied.</p>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
      <p className="mb-4">Welcome to the Admin Dashboard. Here you can manage courses, users, and view platform analytics.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">Manage Courses</h2>
          <p className="text-gray-600 mb-4">Create, edit, and delete courses and their content (modules, lessons).</p>
          <Link href="/admin/courses">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors">
              Go to Course Management
            </button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">Manage Users</h2>
          <p className="text-gray-600 mb-4">View user list, manage roles, and handle enrollments.</p>
           {/* <Link href="/admin/users"> */}
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors">
              Go to User Management
            </button>
          {/* </Link> */}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">Platform Analytics</h2>
          <p className="text-gray-600 mb-4">View overall metrics, reports, and platform usage statistics.</p>
           {/* <Link href="/admin/analytics"> */}
            <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition-colors">
              View Analytics
            </button>
          {/* </Link> */}
        </div>
      </div>
      {/* Placeholder for future content */}
    </div>
  );
};

export default AdminDashboardPage;
