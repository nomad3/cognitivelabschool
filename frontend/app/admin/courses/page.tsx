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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    // Fallback, should be handled by redirect
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-xl text-red-500">Access Denied.</p>
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Courses</h1>
        <Link href="/admin/courses/new">
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors">
            Create New Course
          </button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{course.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{course.instructor_id ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/admin/courses/edit/${course.id}`}>
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    </Link>
                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-900"
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
  );
};

export default AdminCoursesPage;
