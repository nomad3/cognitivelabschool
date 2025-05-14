// frontend/app/admin/courses/edit/[courseId]/page.tsx
"use client";

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface CourseData {
  title: string;
  description: string;
  instructor_id: number | null;
}

const EditCoursePage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [courseData, setCourseData] = useState<Partial<CourseData>>({
    title: '',
    description: '',
    instructor_id: null,
  });
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

    if (courseId) {
      const fetchCourseDetails = async () => {
        setLoading(true);
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
          const response = await fetch(`${backendUrl}/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch course details');
          }
          const data: CourseData = await response.json();
          setCourseData({
            title: data.title || '',
            description: data.description || '',
            instructor_id: data.instructor_id === undefined ? null : data.instructor_id,
          });
        } catch (err) {
          if (err instanceof Error) setError(err.message);
          else setError('An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };
      fetchCourseDetails();
    } else {
      setLoading(false);
      setError("Course ID is missing.");
    }
  }, [router, courseId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleInstructorIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCourseData(prev => ({ ...prev, instructor_id: value === '' ? null : parseInt(value) }));
  };


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const updatePayload: any = {};
      if (courseData.title !== undefined) updatePayload.title = courseData.title;
      if (courseData.description !== undefined) updatePayload.description = courseData.description;
      if (courseData.instructor_id !== undefined) updatePayload.instructor_id = courseData.instructor_id;


      const response = await fetch(`${backendUrl}/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update course');
      }

      alert('Course updated successfully!');
      router.push('/admin/courses'); // Redirect to courses list
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading course data...</div>;
  }
  if (!isAdmin) {
    return <div className="flex justify-center items-center h-screen">Access Denied.</div>;
  }
   if (error && !courseData.title) { // Show general error if course data couldn't be loaded
    return <div className="container mx-auto px-4 py-8 text-red-500">Error: {error} <Link href="/admin/courses" className="text-blue-500">Go back</Link></div>;
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Edit Course (ID: {courseId})</h1>
        <Link href="/admin/courses">
          <button className="text-blue-500 hover:text-blue-700">&larr; Back to Courses</button>
        </Link>
      </div>

      {error && <div className="mb-4 text-red-500 bg-red-100 p-3 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={courseData.title || ''}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            value={courseData.description || ''}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="instructor_id" className="block text-sm font-medium text-gray-700 mb-1">Instructor ID</label>
          <input
            type="number"
            id="instructor_id"
            name="instructor_id"
            value={courseData.instructor_id === null ? '' : String(courseData.instructor_id)}
            onChange={handleInstructorIdChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
           <p className="text-xs text-gray-500 mt-1">Leave blank or set to 0 if no specific instructor.</p>
        </div>

        <div>
          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Course'}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Manage Course Content</h2>
        <Link href={`/admin/courses/${courseId}/modules`}>
          <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition-colors">
            Manage Modules & Lessons
          </button>
        </Link>
      </div>
    </div>
  );
};

export default EditCoursePage;
