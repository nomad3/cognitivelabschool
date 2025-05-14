"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
// Consider a markdown renderer if content_type is markdown
// import ReactMarkdown from 'react-markdown'; 

interface Lesson {
  id: number;
  title: string;
  content: string | null;
  content_type: string;
  order: number;
  module_id: number;
}

export default function LessonPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const lessonId = params?.lessonId as string;
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;

    async function fetchLessonDetails() {
      setIsLoading(true);
      setError(null);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${backendUrl}/lessons/${lessonId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Lesson not found.');
          throw new Error(`Failed to fetch lesson details: ${res.statusText}`);
        }
        const data = await res.json();
        setLesson(data);
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
    fetchLessonDetails();
  }, [lessonId]);

  const renderLessonContent = () => {
    if (!lesson || !lesson.content) return <p className="text-gray-400">No content available for this lesson.</p>;

    switch (lesson.content_type) {
      case 'text':
        return <p className="text-gray-300 whitespace-pre-wrap">{lesson.content}</p>;
      case 'markdown':
        // return <ReactMarkdown className="prose prose-invert max-w-none">{lesson.content}</ReactMarkdown>;
        return <p className="text-gray-300 whitespace-pre-wrap">[Markdown Content Placeholder] {lesson.content}</p>; // Placeholder
      case 'video_url':
        return (
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={lesson.content} // Assuming content is the embeddable URL
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        );
      // Add cases for other content types like 'quiz_id' later
      default:
        return <p className="text-gray-400">Unsupported content type: {lesson.content_type}</p>;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><p>Loading lesson...</p></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500"><p>Error: {error}</p></div>;
  }

  if (!lesson) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><p>Lesson not found.</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <Link href={`/courses/${courseId}`} className="text-indigo-400 hover:text-indigo-300 mb-4 inline-block">
          &larr; Back to Course Details
        </Link>
        <h1 className="text-4xl font-extrabold text-center">{lesson.title}</h1>
      </header>

      <main className="max-w-3xl mx-auto bg-gray-800 shadow-lg rounded-lg p-6 md:p-8">
        <div className="lesson-content">
          {renderLessonContent()}
        </div>
        {/* Placeholder for navigation to next/previous lesson */}
        <div className="mt-8 pt-6 border-t border-gray-700 flex justify-between">
            {/* <button className="text-indigo-400 hover:text-indigo-300">Previous Lesson</button> */}
            {/* <button className="text-indigo-400 hover:text-indigo-300">Next Lesson</button> */}
        </div>
      </main>
    </div>
  );
}
