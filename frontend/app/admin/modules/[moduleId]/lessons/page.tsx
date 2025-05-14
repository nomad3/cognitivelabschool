// frontend/app/admin/modules/[moduleId]/lessons/page.tsx
"use client";

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Lesson {
  id: number;
  title: string;
  content: string | null;
  content_type: string;
  order: number;
}

interface Skill { // Added Skill interface
  id: number;
  name: string;
  description: string | null;
}

interface ModuleDetails {
  id: number;
  title: string;
  course_id: number;
  lessons: Lesson[];
}

const AdminManageModuleLessonsPage = () => {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;

  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false); // Admin or instructor
  const [moduleDetails, setModuleDetails] = useState<ModuleDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // States for creating/editing a lesson
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonContentType, setLessonContentType] = useState('text');
  const [lessonOrder, setLessonOrder] = useState(0);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [isPreAssessmentQuiz, setIsPreAssessmentQuiz] = useState(false); // For quiz type

  const fetchModuleAndLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      // Fetch module details (which should include lessons and course_id)
      const moduleResponse = await fetch(`${backendUrl}/modules/${moduleId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!moduleResponse.ok) {
        if (moduleResponse.status === 404) {
            throw new Error(`Module with ID ${moduleId} not found.`);
        }
        throw new Error('Failed to fetch module details');
      }
      const moduleData: ModuleDetails = await moduleResponse.json();
      setModuleDetails(moduleData);

    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const adminStatus = localStorage.getItem('is_admin');

    if (!token) {
      router.push('/login');
      return;
    }
    // For lesson management, either admin or instructor of the course should be allowed.
    // This check is simplified here; a proper check would involve fetching course instructor.
    // The backend endpoints will enforce this.
    if (adminStatus !== 'true') { 
        // A more robust check would be needed here if non-admins (instructors) can access this.
        // For now, keeping it admin-only on the client-side for simplicity.
        router.push('/'); 
        return;
    }
    setIsAuthorized(true);

    const fetchSkills = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            const response = await fetch(`${backendUrl}/admin/skills/?limit=200`, { // Fetch skills
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch skills');
            }
            const data: Skill[] = await response.json();
            setAvailableSkills(data);
        } catch (err) {
            console.error("Error fetching skills:", err);
            // Not setting main page error for this, but could log or show minor warning
        }
    };

    if (moduleId) {
      fetchModuleAndLessons();
      if (adminStatus === 'true') { // Only fetch skills if admin
        fetchSkills();
      }
    } else {
      setError("Module ID is missing.");
      setLoading(false);
    }
  }, [router, moduleId, fetchModuleAndLessons]); // Added fetchModuleAndLessons, adminStatus is stable

  const openNewLessonModal = () => {
    setEditingLesson(null);
    setLessonTitle('');
    setLessonContent('');
    setLessonContentType('text');
    setLessonOrder(moduleDetails?.lessons.length ? Math.max(...moduleDetails.lessons.map(l => l.order)) + 1 : 0);
    setIsPreAssessmentQuiz(false); // Default for new lesson
    setLessonError(null);
    setShowLessonModal(true);
  };

  const openEditLessonModal = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    const currentContent = lesson.content || '';
    setLessonContent(currentContent);
    const currentContentType = lesson.content_type || 'text';
    setLessonContentType(currentContentType);
    setLessonOrder(lesson.order);
    setLessonError(null);

    if (currentContentType === 'quiz') {
      try {
        const parsedContent = JSON.parse(currentContent);
        setIsPreAssessmentQuiz(parsedContent.isPreAssessment === true);
      } catch (err) { // Changed e to err
        console.error("Error parsing quiz content for edit:", err);
        setIsPreAssessmentQuiz(false); // Default if parsing fails or field missing
      }
    } else {
      setIsPreAssessmentQuiz(false);
    }
    setShowLessonModal(true);
  };

  const handleLessonSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmittingLesson(true);
    setLessonError(null);
    const token = localStorage.getItem('access_token');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    let finalContent = lessonContent;
    if (lessonContentType === 'quiz') {
      try {
        // Try to parse existing content, or start with a new object
        const contentJson = lessonContent ? JSON.parse(lessonContent) : {};
        contentJson.isPreAssessment = isPreAssessmentQuiz;
        // Ensure questions array exists if we want to enforce structure, but for now just set the flag
        if (!contentJson.questions) {
            // contentJson.questions = []; // Initialize if not present
        }
        finalContent = JSON.stringify(contentJson, null, 2);
      } catch (err) { // Changed e to err
        // If current content is not valid JSON, create a new structure
        finalContent = JSON.stringify({ isPreAssessment: isPreAssessmentQuiz, questions: [] }, null, 2);
        setLessonError("Warning: Existing quiz content was not valid JSON and has been reset. Please re-add questions. Error: " + (err instanceof Error ? err.message : String(err)));
      }
    }

    const payload = {
        title: lessonTitle,
        content: finalContent,
        content_type: lessonContentType,
        order: Number(lessonOrder)
    };
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    try {
        let response;
        if (editingLesson) {
            response = await fetch(`${backendUrl}/lessons/${editingLesson.id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(payload),
            });
        } else {
            response = await fetch(`${backendUrl}/modules/${moduleId}/lessons/`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload),
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Failed to ${editingLesson ? 'update' : 'create'} lesson`);
        }
        setShowLessonModal(false);
        fetchModuleAndLessons(); // Refresh list
        alert(`Lesson ${editingLesson ? 'updated' : 'created'} successfully!`);
    } catch (err) {
        if (err instanceof Error) setLessonError(err.message);
        else setLessonError('An unknown error occurred');
    } finally {
        setIsSubmittingLesson(false);
    }
  };
  
  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
    const token = localStorage.getItem('access_token');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    try {
      const response = await fetch(`${backendUrl}/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: 'Failed to delete lesson'}));
        throw new Error(errorData.detail || 'Failed to delete lesson');
      }
      fetchModuleAndLessons(); // Refresh
      alert('Lesson deleted successfully.');
    } catch (err) {
      alert(`Error deleting lesson: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!isAuthorized) return <div className="flex justify-center items-center h-screen">Access Denied.</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-500">Error: {error} <Link href="/admin/courses" className="text-blue-500">Go back to courses</Link></div>;
  if (!moduleDetails) return <div className="container mx-auto px-4 py-8">Module not found or could not load details. <Link href="/admin/courses" className="text-blue-500">Go back to courses</Link></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-gray-800">Manage Lessons for: {moduleDetails.title}</h1>
        {/* This link needs courseId, which is not directly available in moduleDetails without modification */}
        <Link href={`/admin/courses/${moduleDetails.course_id}/modules`} className="text-sm text-blue-500 hover:text-blue-700">
          &larr; Back to Modules
        </Link>
      </div>
      <p className="text-gray-600 mb-6">Module ID: {moduleId}</p>

      <button 
        onClick={openNewLessonModal}
        className="mb-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
      >
        Add New Lesson
      </button>

      {moduleDetails.lessons.length === 0 ? (
        <p>No lessons yet for this module.</p>
      ) : (
        <div className="space-y-4">
          {moduleDetails.lessons.sort((a,b) => a.order - b.order).map(lesson => (
            <div key={lesson.id} className="bg-white p-4 shadow-md rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">{lesson.title} (Order: {lesson.order})</h3>
                  <p className="text-sm text-gray-500">Type: {lesson.content_type}</p>
                  {lesson.content && <p className="text-sm text-gray-600 mt-1 truncate">{lesson.content.substring(0,100)}...</p>}
                </div>
                <div className="space-x-2 flex-shrink-0">
                  <button onClick={() => openEditLessonModal(lesson)} className="text-sm text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDeleteLesson(lesson.id)} className="text-sm text-red-600 hover:text-red-900">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lesson Create/Edit Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">{editingLesson ? 'Edit Lesson' : 'Create New Lesson'}</h2>
            {lessonError && <p className="text-red-500 mb-3">{lessonError}</p>}
            <form onSubmit={handleLessonSubmit}>
              <div className="mb-4">
                <label htmlFor="lessonTitle" className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" id="lessonTitle" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
              </div>
              <div className="mb-4">
                <label htmlFor="lessonContent" className="block text-sm font-medium text-gray-700">Content</label>
                <textarea id="lessonContent" value={lessonContent} onChange={e => setLessonContent(e.target.value)} rows={5} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
              </div>
              <div className="mb-4">
                <label htmlFor="lessonContentType" className="block text-sm font-medium text-gray-700">Content Type</label>
                <select 
                    id="lessonContentType" 
                    value={lessonContentType} 
                    onChange={e => setLessonContentType(e.target.value)} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="text">Text</option>
                    <option value="markdown">Markdown</option>
                    <option value="video_url">Video URL</option>
                    <option value="quiz">Quiz (JSON)</option>
                </select>
                {lessonContentType === 'quiz' && (
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    <div className="mb-2">
                        <label htmlFor="isPreAssessmentQuiz" className="flex items-center text-sm text-gray-700">
                            <input 
                                type="checkbox" 
                                id="isPreAssessmentQuiz"
                                checked={isPreAssessmentQuiz}
                                onChange={e => setIsPreAssessmentQuiz(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"
                            />
                            Is this a Pre-assessment Quiz?
                        </label>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                        For quizzes, structure your content as JSON. Include `isPreAssessment` and a `questions` array.
                        Each question can have an optional `skill_ids` array. Example:
                    </p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`{
  "isPreAssessment": false,
  "questions": [
    {
      "id": "q1", 
      "text": "Question text?", 
      "type": "multiple-choice", 
      "skill_ids": [1, 2], 
      "options": [...], 
      "correctAnswer": "..." 
    }
  ]
}`}
                    </pre>
                    {availableSkills.length > 0 && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-600 mb-1">Available Skill IDs:</p>
                            <ul className="list-disc list-inside text-xs">
                                {availableSkills.map(skill => (
                                    <li key={skill.id}>{skill.id}: {skill.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="lessonOrder" className="block text-sm font-medium text-gray-700">Order</label>
                <input type="number" id="lessonOrder" value={lessonOrder} onChange={e => setLessonOrder(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowLessonModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                <button type="submit" disabled={isSubmittingLesson} className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50">
                  {isSubmittingLesson ? 'Saving...' : (editingLesson ? 'Save Changes' : 'Create Lesson')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageModuleLessonsPage;
