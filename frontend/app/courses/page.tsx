"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Lesson {
  id: number;
  title: string;
  content: string | null;
  content_type: string;
  order: number;
  module_id: number;
}

interface Module {
  id: number;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: number;
  title: string;
  description: string | null;
  instructor_id: number | null;
  modules: Module[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      setIsLoading(true);
      setError(null);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${backendUrl}/courses/`);
        if (!res.ok) {
          throw new Error(`Failed to fetch courses: ${res.statusText}`);
        }
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><p>Loading courses...</p></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500"><p>Error: {error}</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold">Available Courses</h1>
      </header>
      {courses.length === 0 ? (
        <p className="text-center text-gray-400">No courses available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-gray-800 shadow-lg rounded-lg p-6 hover:shadow-indigo-500/40 hover:bg-gray-700/60 transition-all duration-300 transform hover:-translate-y-1">
              <h2 className="text-2xl font-semibold mb-2 text-indigo-400">{course.title}</h2>
              <p className="text-gray-400 mb-4 line-clamp-3 min-h-[3em]">{course.description || 'No description available.'}</p> {/* Added min-h for consistent card height */}
              {/* <p className="text-sm text-gray-500 mb-1">Instructor ID: {course.instructor_id || 'N/A'}</p> */}
              <Link href={`/courses/${course.id}`} className="inline-block mt-4 px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
                View Course
              </Link>
            </div>
          ))}
        </div>
      )}
       <div className="mt-12 text-center">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center max-w-xs mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H15a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
    </div>
  );
}
