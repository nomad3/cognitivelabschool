'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // For linking to courses/modules

interface StudyRecommendationItem {
  id: number;
  title: string;
  type: 'course' | 'module';
  description?: string;
}

interface StudyPlanResponse {
  recommendations: StudyRecommendationItem[];
}

const StudyPlanPage = () => {
  const [studyPlan, setStudyPlan] = useState<StudyPlanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudyPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('accessToken'); // Use 'accessToken'
        if (!token) {
          setError('You must be logged in to view your study plan.');
          setLoading(false);
          // Optionally redirect to login page
          // window.location.href = '/login';
          return;
        }

        const response = await fetch('/api/users/me/study-plan', { // Assuming Next.js API route proxy or direct backend URL
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Session expired or invalid. Please log in again.');
            // Optionally clear token and redirect
            // localStorage.removeItem('accessToken'); // Use 'accessToken'
            // window.location.href = '/login';
          } else {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
          }
        }
        
        const data: StudyPlanResponse = await response.json();
        setStudyPlan(data);
      } catch (err) {
        console.error("Failed to fetch study plan:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudyPlan();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading your personalized study plan...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!studyPlan || studyPlan.recommendations.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Personalized Study Plan</h1>
        <p>No specific recommendations for you at this time. Keep learning and taking quizzes to get personalized suggestions!</p>
        <p className="mt-4">
            <Link href="/courses" className="text-blue-500 hover:underline">
                Explore Courses
            </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Personalized Study Plan</h1>
      <p className="mb-6 text-center text-gray-700">
        Based on your recent activity and skill assessments, here are some recommended courses and modules to help you grow.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studyPlan.recommendations.map((item) => (
          <div key={`${item.type}-${item.id}`} className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2 text-blue-600">
              {item.title} <span className="text-sm font-normal text-gray-500">({item.type})</span>
            </h2>
            {item.description && <p className="text-gray-600 mb-3">{item.description}</p>}
            {item.type === 'course' && (
              <Link href={`/courses/${item.id}`} className="text-blue-500 hover:text-blue-700 hover:underline font-medium">
                Go to Course &rarr;
              </Link>
            )}
            {/* TODO: Add link for modules if a dedicated module page exists, e.g., /modules/${item.id} or /courses/${courseId}/modules/${moduleId} */}
            {item.type === 'module' && (
                 <p className="text-sm text-gray-500">(Module link to be implemented)</p>
              // Example: <Link href={`/modules/${item.id}`} className="text-blue-500 hover:underline">Go to Module</Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyPlanPage;
