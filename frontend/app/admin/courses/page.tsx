// frontend/app/admin/courses/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  description: string | null;
  instructor_id: number | null;
  // Add other relevant course fields if needed
}

const AdminCoursesPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
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
    setIsAdmin(true);

    const fetchCourses = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/courses/?limit=100`, { // Fetch more courses
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data: Course[] = await response.json();
        setCourses(data);
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

    fetchCourses();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (!isAdmin) {
    // Fallback, should be handled by redirect
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
        <p className="text-xl text-red-500">Access Denied.</p>
        <p className="text-gray-300">You do not have permission to view this page.</p>
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-red-400">Error: {error}</div>;
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    try {
      const token = localStorage.getItem('access_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to delete course' }));
        throw new Error(errorData.detail || 'Failed to delete course');
      }
      // Refresh courses list
      setCourses(courses.filter(course => course.id !== courseId));
      alert('Course deleted successfully.');
    } catch (err) {
        alert(`Error deleting course: ${err instanceof Error ? err.message : String(err)}`);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-400">Manage Courses</h1>
          <Link href="/admin/courses/new">
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors shadow-md hover:shadow-lg">
              Create New Course
            </button>
          </Link>
        </div>

        {courses.length === 0 ? (
          <p className="text-center text-gray-400 text-lg">No courses found. Start by creating a new one!</p>
        ) : (
          <div className="bg-gray-800 shadow-xl rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Instructor ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{course.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{course.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{course.instructor_id ?? 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/admin/courses/edit/${course.id}`}>
                        <button className="text-indigo-400 hover:text-indigo-300 mr-4 font-semibold">Edit</button>
                      </Link>
                      <Link href={`/admin/courses/${course.id}/modules`}>
                        <button className="text-teal-400 hover:text-teal-300 mr-4 font-semibold">Modules</button>
                      </Link>
                      <button 
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-500 hover:text-red-400 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
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

export default AdminCoursesPage;
