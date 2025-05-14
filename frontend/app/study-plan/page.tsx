'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Placeholder Icons - Consider Heroicons or similar
const IconBookOpen = () => <svg className="w-6 h-6 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m0 0A8.001 8.001 0 004 12a8.001 8.001 0 008 8.247zM12 6.253c0-1.657 1.343-3 3-3s3 1.343 3 3c0 1.657-1.343 3-3 3s-3-1.343-3-3zm0 0c0-1.657-1.343-3-3-3s-3 1.343-3 3c0 1.657 1.343 3 3 3s3-1.343 3-3z"></path></svg>;
const IconSparkles = () => <svg className="w-6 h-6 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>;
const IconChartBar = () => <svg className="w-6 h-6 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;


interface StudyRecommendationItem {
  id: number;
  title: string;
  type: 'course' | 'module'; // Assuming module recommendations might link to a course page if no direct module page
  description?: string;
  // For modules, we might need course_id to construct the link if modules are part of courses
  course_id?: number; 
}

interface StudyPlanResponse {
  recommendations: StudyRecommendationItem[];
  // We can add more personalized data here in the future
  user_name?: string; // Example: "Jane Doe"
  enrolled_courses_count?: number;
  completed_lessons_count?: number;
}

const StudentDashboardPage = () => {
  const [studyPlan, setStudyPlan] = useState<StudyPlanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Learner"); // Default name

  useEffect(() => {
    const fetchStudyPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login'); // Redirect if not logged in
          return;
        }
        
        // Fetch user's name - placeholder, ideally from /users/me or token
        // const userDetailsResponse = await fetch('/api/users/me', { headers: {'Authorization': `Bearer ${token}`} });
        // if(userDetailsResponse.ok) {
        //   const userData = await userDetailsResponse.json();
        //   setUserName(userData.full_name || "Learner");
        // }


        const response = await fetch('/api/users/me/study-plan', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Session expired or invalid. Please log in again.');
            localStorage.removeItem('accessToken');
            router.push('/login');
          } else {
            const errorData = await response.json().catch(() => ({ detail: 'Failed to load study plan.' }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
          }
          return; // Important to return after handling error
        }
        
        const data: StudyPlanResponse = await response.json();
        setStudyPlan(data);
        if(data.user_name) setUserName(data.user_name); // If backend provides name

      } catch (err) {
        console.error("Failed to fetch study plan:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudyPlan();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Oops!</h1>
        <p className="text-lg text-gray-300 mb-6">{error}</p>
        <Link href="/login" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Bar (assuming it's part of the main layout.tsx or imported here) */}
      {/* For standalone, copy the nav from frontend/app/page.tsx or create a shared component */}
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24"> {/* Added pt-24 if nav is fixed */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
              Welcome Back, {userName}!
            </span>
          </h1>
          <p className="mt-3 text-lg text-gray-400">Ready to continue your AI learning journey?</p>
        </header>

        {/* Quick Stats / Overview - Placeholder */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 uppercase flex items-center"><IconBookOpen />Enrolled Courses</h3>
            <p className="mt-1 text-3xl font-semibold text-indigo-400">{studyPlan?.enrolled_courses_count ?? 0}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 uppercase flex items-center"><IconSparkles />Lessons Completed</h3>
            <p className="mt-1 text-3xl font-semibold text-green-400">{studyPlan?.completed_lessons_count ?? 0}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 uppercase flex items-center"><IconChartBar />Skills Progress</h3>
            <p className="mt-1 text-lg text-gray-500">(Feature coming soon)</p>
          </div>
        </section>

        {/* Personalized Study Plan / Recommendations */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-indigo-400 flex items-center">
            <IconSparkles /> Your Personalized Study Plan
          </h2>
          {(!studyPlan || studyPlan.recommendations.length === 0) ? (
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center border border-gray-700">
              <p className="text-xl text-gray-300 mb-4">No specific recommendations for you at this time.</p>
              <p className="text-gray-400 mb-6">Keep learning by exploring our courses and completing lessons and quizzes to get personalized suggestions!</p>
              <Link href="/courses" className="inline-block px-8 py-3 text-lg font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-colors">
                Explore All Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studyPlan.recommendations.map((item) => (
                <div key={`${item.type}-${item.id}`} className="bg-gray-800 shadow-xl rounded-lg p-6 border border-gray-700 hover:border-indigo-500/70 transition-all duration-300 flex flex-col">
                  <h3 className="text-2xl font-semibold mb-2 text-indigo-400">
                    {item.title}
                  </h3>
                  <span className="text-xs uppercase font-semibold tracking-wider text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full self-start mb-3">{item.type}</span>
                  {item.description && <p className="text-gray-400 mb-4 flex-grow">{item.description}</p>}
                  
                  {item.type === 'course' && (
                    <Link href={`/courses/${item.id}`} className="mt-auto self-start inline-block px-6 py-2 text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                      Go to Course &rarr;
                    </Link>
                  )}
                  {item.type === 'module' && (
                    // Assuming modules are part of a course, link to the course and highlight the module.
                    // This requires course_id to be part of the recommendation item for modules.
                    item.course_id ? (
                        <Link href={`/courses/${item.course_id}?module=${item.id}`} className="mt-auto self-start inline-block px-6 py-2 text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors">
                            Go to Module &rarr;
                        </Link>
                    ) : <p className="text-sm text-gray-500 mt-auto self-start">(Module link unavailable)</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Link to browse all courses */}
        <div className="mt-16 text-center">
            <Link href="/courses" className="text-xl font-semibold text-indigo-400 hover:text-indigo-300 border-b-2 border-indigo-400 hover:border-indigo-300 pb-1 transition-colors">
                Or, Browse All Available Courses
            </Link>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboardPage;
