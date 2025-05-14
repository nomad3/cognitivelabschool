"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Removed useRouter
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

interface QuizQuestionOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  type: string; // e.g., 'multiple-choice'
  options: QuizQuestionOption[];
  skill_ids?: number[]; // Optional
  // correctAnswer field is used by backend, not directly shown to student during quiz
}

interface QuizContent {
  isPreAssessment?: boolean;
  questions: QuizQuestion[];
}

interface UserAnswer {
  question_id: string;
  selected_option_id: string;
}

interface QuizSubmissionResult {
  lesson_id: number;
  overall_score: number;
  score_per_skill?: Record<number, number>;
}


export default function LessonPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const lessonId = params?.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quiz specific state
  const [quizData, setQuizData] = useState<QuizContent | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // { questionId: selectedOptionId }
  const [quizResult, setQuizResult] = useState<QuizSubmissionResult | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizSubmissionError, setQuizSubmissionError] = useState<string | null>(null);


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
        const data: Lesson = await res.json();
        setLesson(data);
        if (data.content_type === 'quiz' && data.content) {
          try {
            const parsedQuizData: QuizContent = JSON.parse(data.content);
            setQuizData(parsedQuizData);
            // Initialize answers
            const initialAnswers: Record<string, string> = {};
            // parsedQuizData.questions.forEach(q => initialAnswers[q.id] = ''); // Don't pre-select
            setUserAnswers(initialAnswers);

          } catch (e) {
            console.error("Failed to parse quiz content:", e);
            setError("Failed to load quiz: Invalid format.");
            setQuizData(null);
          }
        } else {
          setQuizData(null); // Reset if not a quiz or no content
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
    }
    fetchLessonDetails();
  }, [lessonId]);

  const handleAnswerChange = (questionId: string, selectedOptionId: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: selectedOptionId }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizData || !lesson) return;
    setIsSubmittingQuiz(true);
    setQuizSubmissionError(null);
    setQuizResult(null);

    const submissionAnswers: UserAnswer[] = Object.entries(userAnswers).map(([question_id, selected_option_id]) => ({
      question_id,
      selected_option_id,
    }));

    if (submissionAnswers.length !== quizData.questions.length) {
        setQuizSubmissionError("Please answer all questions before submitting.");
        setIsSubmittingQuiz(false);
        return;
    }
    
    const token = localStorage.getItem('access_token');
    if (!token) {
        setError("You must be logged in to submit a quiz."); // Should be handled by page auth ideally
        setIsSubmittingQuiz(false);
        return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${backendUrl}/lessons/${lesson.id}/submit_quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: submissionAnswers }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({detail: 'Failed to submit quiz'}));
        throw new Error(errorData.detail || 'Failed to submit quiz');
      }
      const resultData: QuizSubmissionResult = await res.json();
      setQuizResult(resultData);
    } catch (err) {
      if (err instanceof Error) {
        setQuizSubmissionError(err.message);
      } else {
        setQuizSubmissionError("An unknown error occurred during submission.");
      }
    } finally {
      setIsSubmittingQuiz(false);
    }
  };


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
      case 'quiz':
        if (quizResult) {
          return (
            <div className="p-4 bg-gray-700 rounded-md">
              <h3 className="text-2xl font-semibold mb-3 text-indigo-400">Quiz Results</h3>
              <p className="text-xl mb-2">Overall Score: <span className="font-bold">{quizResult.overall_score.toFixed(2)}%</span></p>
              {quizResult.score_per_skill && Object.keys(quizResult.score_per_skill).length > 0 && (
                <div>
                  <h4 className="text-lg font-medium mb-1">Score per Skill:</h4>
                  <ul className="list-disc list-inside">
                    {Object.entries(quizResult.score_per_skill).map(([skillId, score]) => (
                      <li key={skillId} className="text-sm">Skill ID {skillId}: {score.toFixed(2)}%</li>
                    ))}
                  </ul>
                </div>
              )}
               <button 
                onClick={() => { /* Logic to retake or go to next lesson */ 
                    setQuizResult(null); 
                    setUserAnswers({});
                    // Potentially re-fetch lesson if content could change or to reset state cleanly
                }}
                className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Retake Quiz (if allowed) / View Content
              </button>
            </div>
          );
        }
        if (!quizData || !quizData.questions || quizData.questions.length === 0) {
          return <p className="text-gray-400">Quiz is not configured correctly or has no questions.</p>;
        }
        return (
          <div className="space-y-6">
            {quizData.questions.map((q, qIndex) => (
              <div key={q.id || qIndex} className="p-4 bg-gray-700 rounded-md">
                <p className="font-semibold text-lg mb-2 text-gray-200">{qIndex + 1}. {q.text}</p>
                <div className="space-y-2">
                  {q.options.map(opt => (
                    <label key={opt.id} className="flex items-center p-2 rounded hover:bg-gray-600 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={opt.id}
                        checked={userAnswers[q.id] === opt.id}
                        onChange={() => handleAnswerChange(q.id, opt.id)}
                        className="form-radio h-4 w-4 text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-400"
                      />
                      <span className="ml-3 text-gray-300">{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {quizSubmissionError && <p className="text-red-400 mt-4">{quizSubmissionError}</p>}
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmittingQuiz}
              className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
            >
              {isSubmittingQuiz ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        );
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
