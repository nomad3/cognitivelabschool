// frontend/app/admin/courses/new/page.tsx
"use client";

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CreateCoursePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // const [instructorId, setInstructorId] = useState<string>(''); // Optional: if admin can assign instructor
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const adminStatus = localStorage.getItem('is_admin');

    if (!token) {
      router.push('/login');
      return;
    }
    if (adminStatus !== 'true') {
      router.push('/'); // Redirect non-admins
      return;
    }
    setIsAdmin(true);
    setLoading(false);
  }, [router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const courseData: { title: string; description?: string; instructor_id?: number } = { title };
      if (description) {
        courseData.description = description;
      }
      // If admin can set instructor_id, parse and add it here.
      // For now, backend assigns current_user (admin) as instructor.
      // if (instructorId) courseData.instructor_id = parseInt(instructorId);


      const response = await fetch(`${backendUrl}/courses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create course');
      }

      alert('Course created successfully!');
      router.push('/admin/courses'); // Redirect to courses list
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  if (!isAdmin) {
    return <div className="flex justify-center items-center h-screen">Access Denied.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Create New Course</h1>
        <Link href="/admin/courses">
          <button className="text-blue-500 hover:text-blue-700">&larr; Back to Courses</button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        {error && <div className="mb-4 text-red-500 bg-red-100 p-3 rounded">{error}</div>}
        
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {/* Optional: Instructor ID input if admin should assign it manually 
        <div className="mb-6">
          <label htmlFor="instructorId" className="block text-sm font-medium text-gray-700 mb-1">Instructor ID (Optional)</label>
          <input
            type="number"
            id="instructorId"
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        */}

        <div>
          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCoursePage;
