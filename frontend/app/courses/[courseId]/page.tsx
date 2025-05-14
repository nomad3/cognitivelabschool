"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Corrected import for useParams
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

interface EnrollmentResponse {
    id: number;
    user_id: number;
    course_id: number;
    enrolled_at: string;
    completed_lessons: number[]; // Added completed_lessons
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params?.courseId as string; // Changed from params?.id
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentEnrollment, setCurrentEnrollment] = useState<EnrollmentResponse | null>(null);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const fetchCourseAndEnrollmentDetails = async () => {
    if (!courseId) return;
    setIsLoading(true);
    setError(null);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    try {
      // Fetch course details
      const courseRes = await fetch(`${backendUrl}/courses/${courseId}`);
      if (!courseRes.ok) {
        if (courseRes.status === 404) throw new Error('Course not found.');
        throw new Error(`Failed to fetch course details: ${courseRes.statusText}`);
      }
      const courseData = await courseRes.json();
      setCourse(courseData);

      // Check enrollment status
      const token = localStorage.getItem('accessToken');
      if (token) {
        const enrollmentsRes = await fetch(`${backendUrl}/users/me/enrollments/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (enrollmentsRes.ok) {
          const enrollments: EnrollmentResponse[] = await enrollmentsRes.json();
          const numericCourseId = parseInt(courseId, 10);
          const userEnrollment = enrollments.find(e => e.course_id === numericCourseId);
          if (userEnrollment) {
            setIsEnrolled(true);
            setCurrentEnrollment(userEnrollment);
          } else {
            setIsEnrolled(false);
            setCurrentEnrollment(null);
          }
        }
      } else {
        setIsEnrolled(false);
        setCurrentEnrollment(null);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCourseAndEnrollmentDetails();
  }, [courseId, fetchCourseAndEnrollmentDetails]); // Added fetchCourseAndEnrollmentDetails

  const handleEnroll = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }

    // A bit of a hack to get user_id, ideally from a /users/me endpoint or decoded JWT
    // For MVP, we assume the token's "sub" (email) can be used to find user_id if needed,
    // but the backend /enrollments/ endpoint uses current_user.id
    
    setIsEnrolling(true);
    setEnrollmentError(null);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    try {
        // The backend will get user_id from the token
        const res = await fetch(`${backendUrl}/enrollments/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ course_id: parseInt(courseId, 10) }), // user_id will be taken from current_user by backend
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || 'Failed to enroll in course.');
        }
        setIsEnrolled(true);
        // Optionally, refetch course data or user data if enrollment changes displayed info
    } catch (err) {
        if (err instanceof Error) {
            setEnrollmentError(err.message);
        } else {
            setEnrollmentError("An unknown error occurred during enrollment.");
        }
    } finally {
        setIsEnrolling(false);
    }
  };

  const handleToggleLessonComplete = async (lessonId: number) => {
    if (!currentEnrollment) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const isCompleted = currentEnrollment.completed_lessons.includes(lessonId);
    const endpoint = isCompleted 
      ? `${backendUrl}/enrollments/${currentEnrollment.id}/lessons/${lessonId}/incomplete`
      : `${backendUrl}/enrollments/${currentEnrollment.id}/lessons/${lessonId}/complete`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to update lesson status.');
      }
      const updatedEnrollment: EnrollmentResponse = await res.json();
      setCurrentEnrollment(updatedEnrollment); 
      // Optionally, show a success message
    } catch (err) {
      if (err instanceof Error) {
        // setLessonCompletionError(err.message); // TODO: Add state for this error
        console.error("Failed to toggle lesson completion:", err.message);
      } else {
        // setLessonCompletionError("An unknown error occurred.");
        console.error("An unknown error occurred while toggling lesson completion.");
      }
    }
  };


  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><p>Loading course details...</p></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500"><p>Error: {error}</p></div>;
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><p>Course not found.</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-4xl mx-auto">
        <Link href="/courses" className="text-indigo-400 hover:text-indigo-300 font-semibold py-2 px-4 rounded transition-colors flex items-center mb-4 max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H15a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Courses
        </Link>
        <h1 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 py-2">{course.title}</h1>
        <p className="mt-3 text-lg text-gray-400 text-center">{course.description || 'No description available.'}</p>
        {/* <p className="text-sm text-gray-500 text-center mt-1">Instructor ID: {course.instructor_id || 'N/A'}</p> */}
      </header>

      <div className="max-w-4xl mx-auto">
        {!isEnrolled ? (
            <button 
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="w-full mb-8 py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
                {isEnrolling ? 'Enrolling...' : 'Enroll in this Course'}
            </button>
        ) : (
            <p className="text-center text-green-400 font-semibold mb-8 text-lg">You are enrolled in this course.</p>
        )}
        {enrollmentError && <p className="text-red-500 text-center mb-4">{enrollmentError}</p>}


        <h2 className="text-3xl font-semibold mb-6 text-gray-100">Modules</h2>
        {course.modules && course.modules.length > 0 ? (
          <div className="space-y-8"> {/* Increased space between modules */}
            {course.modules.sort((a,b) => a.order - b.order).map((module) => (
              <div key={module.id} className="bg-gray-800 shadow-xl rounded-lg p-6 border border-gray-700 hover:border-indigo-500/50 transition-all duration-300">
                <h3 className="text-2xl font-semibold text-indigo-400 mb-3">{module.title}</h3>
                <p className="text-gray-400 mb-5">{module.description || 'No module description.'}</p>
                {module.lessons && module.lessons.length > 0 ? (
                  <ul className="space-y-3">
                    {module.lessons.sort((a,b) => a.order - b.order).map((lesson) => {
                      const isCompleted = currentEnrollment?.completed_lessons?.includes(lesson.id);
                      return (
                        <li key={lesson.id} className={`flex items-center justify-between bg-gray-700 p-4 rounded-md hover:bg-gray-600/70 transition-colors ${isCompleted ? 'opacity-70' : ''}`}>
                          <Link href={`/courses/${courseId}/lessons/${lesson.id}`} className="flex-grow flex items-center">
                            {isCompleted ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              // Placeholder for content type icon - using simple text for now
                              <span className="mr-3 text-gray-500 text-sm w-6 h-6 flex items-center justify-center">
                                {lesson.content_type === 'quiz' ? 'Q' : lesson.content_type === 'video_url' ? 'V' : 'T'}
                              </span>
                            )}
                            <span className={`text-lg ${isCompleted ? 'text-green-400 line-through' : 'text-indigo-300 hover:text-indigo-200'}`}>{lesson.title}</span>
                            <span className="ml-3 text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">{lesson.content_type}</span>
                          </Link>
                          {isEnrolled && currentEnrollment && (
                             <button 
                               onClick={() => handleToggleLessonComplete(lesson.id)}
                               className={`ml-4 px-3 py-1 text-xs rounded-md font-semibold ${isCompleted ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white transition-colors`}
                             >
                               {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                             </button>
                           )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No lessons in this module yet.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No modules available for this course yet.</p>
        )}
      </div>
    </div>
  );
}
