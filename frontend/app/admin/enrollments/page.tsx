// frontend/app/admin/enrollments/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserSummary {
  id: number;
  email: string;
  full_name: string | null;
}

interface CourseSummary {
  id: number;
  title: string;
}

interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string; // Assuming ISO string from backend
  completed_lessons: number[];
  user: UserSummary;
  course: CourseSummary;
}

const AdminEnrollmentsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const adminStatus = localStorage.getItem('is_admin');

    if (!token) {
      router.push('/login');
      return;
    }
    if (adminStatus !== 'true') {
      router.push('/'); // Redirect non-admins to home
      return;
    }
    setIsAdminUser(true);

    const fetchEnrollments = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/admin/enrollments/?limit=200`, { // Fetch more enrollments
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({detail: 'Failed to fetch enrollments'}));
          throw new Error(errorData.detail || 'Failed to fetch enrollments');
        }
        const data: Enrollment[] = await response.json();
        setEnrollments(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading enrollments...</div>;
  }

  if (!isAdminUser) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
        <p className="text-xl text-red-500">Access Denied.</p>
        <p className="text-gray-300">You do not have permission to view this page.</p>
      </div>
    );
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 text-white py-8 container mx-auto px-4 text-red-400">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-teal-400">Manage Enrollments</h1>
          <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 font-semibold py-2 px-4 rounded transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H15a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Admin Dashboard
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <p className="text-center text-gray-400 text-lg">No enrollments found.</p>
        ) : (
          <div className="bg-gray-800 shadow-xl rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Course Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Enrolled At</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Completed Lessons</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{enrollment.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{enrollment.user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{enrollment.course.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{enrollment.completed_lessons.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEnrollmentsPage;
