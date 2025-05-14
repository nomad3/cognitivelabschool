// frontend/app/admin/courses/edit/[courseId]/page.tsx
"use client";

import React, { useEffect, useState, FormEvent, useCallback } from 'react'; // Added useCallback
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Skill {
  id: number;
  name: string;
  description: string | null;
}

interface CourseDataFromAPI { // Renamed to distinguish from state
  title: string;
  description: string | null;
  instructor_id: number | null;
  associated_skills: Skill[];
}

interface CourseState { // For component state, description is always string
    title: string;
    description: string;
    instructor_id: number | null;
    associated_skills: Skill[];
}

interface CourseUpdatePayload {
  title?: string;
  description?: string;
  instructor_id?: number | null;
  // associated_skills will be handled by separate API calls, not in this payload
}

const EditCoursePage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [courseData, setCourseData] = useState<Partial<CourseState>>({ // Use CourseState
    title: '',
    description: '', // Ensure description is always string in state
    instructor_id: null,
    associated_skills: [],
  });
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [skillManagementError, setSkillManagementError] = useState<string | null>(null);

  const fetchCourseDetails = useCallback(async (currentCourseId: string, currentToken: string | null) => {
    if (!currentCourseId || !currentToken) {
        setError("Course ID or token is missing for fetching details.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/courses/${currentCourseId}`, {
        headers: { 'Authorization': `Bearer ${currentToken}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch course details');
      }
      const data: CourseDataFromAPI = await response.json();
      setCourseData({
        title: data.title || '',
        description: data.description || '', // Ensure string
        instructor_id: data.instructor_id === undefined ? null : data.instructor_id,
        associated_skills: data.associated_skills || [],
      });
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array as it doesn't depend on component scope vars that change

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const adminStatus = localStorage.getItem('is_admin');

    if (!token) {
      router.push('/login');
      return;
    }
    if (adminStatus !== 'true') {
      router.push('/'); 
      return;
    }
    setIsAdmin(true);

    if (courseId) {
      fetchCourseDetails(courseId, token);

      const fetchAllSkills = async () => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            const skillsResponse = await fetch(`${backendUrl}/admin/skills/?limit=200`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!skillsResponse.ok) throw new Error ('Failed to fetch available skills');
            const skillsData: Skill[] = await skillsResponse.json();
            setAvailableSkills(skillsData);
        } catch (err) {
            console.error("Failed to fetch skills for admin course edit:", err);
            setSkillManagementError(err instanceof Error ? err.message : "Could not load skills list.");
        }
      };
      fetchAllSkills();
    } else {
      setError("Course ID is missing.");
      setLoading(false);
    }
  }, [router, courseId, fetchCourseDetails]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleInstructorIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCourseData(prev => ({ ...prev, instructor_id: value === '' ? null : parseInt(value) }));
  };

  const handleSkillChange = async (skillId: number, isAssociated: boolean) => {
    const token = localStorage.getItem('access_token');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const method = isAssociated ? 'DELETE' : 'POST';
    const action = isAssociated ? 'remove' : 'add';
    setSkillManagementError(null);

    try {
        const response = await fetch(`${backendUrl}/admin/courses/${courseId}/skills/${skillId}`, {
            method: method,
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.detail || `Failed to ${action} skill`);
        }
        // Refresh course data to get updated associated_skills
        if (token) fetchCourseDetails(courseId, token); 
    } catch (err) {
        if (err instanceof Error) setSkillManagementError(err.message);
        else setSkillManagementError(`An unknown error occurred while trying to ${action} skill.`);
    }
  };


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const updatePayload: CourseUpdatePayload = {};
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
      alert('Course details updated successfully! Skill changes are saved separately.');
      // No need to redirect if we want them to continue managing skills
      // router.push('/admin/courses'); 
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !courseData.title) { // Show loading only if no data yet
    return <div className="flex justify-center items-center h-screen">Loading course data...</div>;
  }
  if (!isAdmin) {
    return <div className="flex justify-center items-center h-screen">Access Denied.</div>;
  }
   if (error && !courseData.title) { 
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

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md mb-8">
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
            value={courseData.description} // Should be string due to state management
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
            {submitting ? 'Updating Course Details...' : 'Update Course Details'}
          </button>
        </div>
      </form>

      {/* Skill Management Section */}
      <div className="my-8 pt-6 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Associated Skills</h2>
        {skillManagementError && <p className="text-red-500 mb-2 bg-red-100 p-3 rounded">{skillManagementError}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Available Skills</h3>
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {availableSkills.filter(s => !courseData.associated_skills?.find(as => as.id === s.id)).map(skill => (
                        <div key={skill.id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
                            <span>{skill.name}</span>
                            <button 
                                onClick={() => handleSkillChange(skill.id, false)}
                                className="text-xs bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded"
                            >
                                Add
                            </button>
                        </div>
                    ))}
                    {availableSkills.filter(s => !courseData.associated_skills?.find(as => as.id === s.id)).length === 0 && <p className="text-sm text-gray-500">No more skills to add.</p>}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Current Skills for Course</h3>
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {courseData.associated_skills?.map(skill => (
                         <div key={skill.id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
                            <span>{skill.name}</span>
                            <button 
                                onClick={() => handleSkillChange(skill.id, true)}
                                className="text-xs bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    {(!courseData.associated_skills || courseData.associated_skills.length === 0) && <p className="text-sm text-gray-500">No skills associated yet.</p>}
                </div>
            </div>
        </div>
      </div>

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
