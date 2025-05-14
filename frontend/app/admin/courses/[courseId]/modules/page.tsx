// frontend/app/admin/courses/[courseId]/modules/page.tsx
"use client";

import React, { useEffect, useState, FormEvent, useCallback } from 'react'; // Added useCallback
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Skill {
  id: number;
  name: string;
  description: string | null;
}

interface Module {
  id: number;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
  associated_skills: Skill[]; 
}

interface Lesson {
  id: number;
  title: string;
}

interface CourseDetails {
  id: number;
  title: string;
  modules: Module[];
}

const AdminManageCourseModulesPage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [moduleOrder, setModuleOrder] = useState(0);
  const [moduleError, setModuleError] = useState<string | null>(null);
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);
  
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedModuleSkills, setSelectedModuleSkills] = useState<Skill[]>([]);
  const [skillManagementError, setSkillManagementError] = useState<string | null>(null);

  const fetchCourseAndModules = useCallback(async () => {
    if (!courseId) return; // Guard against missing courseId early
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch course details and modules');
      }
      const data: CourseDetails = await response.json();
      setCourseDetails(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [courseId]); // courseId is a dependency

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
      fetchCourseAndModules();
      if (adminStatus === 'true') {
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
              console.error("Failed to fetch skills for module management:", err);
              setSkillManagementError(err instanceof Error ? err.message : "Could not load skills list.");
          }
        };
        fetchAllSkills();
      }
    } else {
      setError("Course ID is missing.");
      setLoading(false);
    }
  }, [router, courseId, fetchCourseAndModules]);

  const openNewModuleModal = () => {
    setEditingModule(null);
    setModuleTitle('');
    setModuleDescription('');
    setModuleOrder(courseDetails?.modules.length ? Math.max(...courseDetails.modules.map(m => m.order)) + 1 : 0);
    setSelectedModuleSkills([]);
    setModuleError(null);
    setShowModuleModal(true);
  };

  const openEditModuleModal = (module: Module) => {
    setEditingModule(module);
    setModuleTitle(module.title);
    setModuleDescription(module.description || '');
    setModuleOrder(module.order);
    setSelectedModuleSkills(module.associated_skills || []);
    setModuleError(null);
    setShowModuleModal(true);
  };

  const handleModuleSkillChange = async (skillId: number, isAssociated: boolean) => {
    if (!editingModule) return;
    const token = localStorage.getItem('access_token');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const method = isAssociated ? 'DELETE' : 'POST';
    const action = isAssociated ? 'remove' : 'add';
    setSkillManagementError(null);

    try {
        const response = await fetch(`${backendUrl}/admin/modules/${editingModule.id}/skills/${skillId}`, {
            method: method,
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.detail || `Failed to ${action} skill for module`);
        }
        const updatedModuleFromServer: Module = await response.json();
        setSelectedModuleSkills(updatedModuleFromServer.associated_skills || []);
        fetchCourseAndModules(); // Refresh the entire course details to update the list
    } catch (err) {
        if (err instanceof Error) setSkillManagementError(err.message);
        else setSkillManagementError(`An unknown error occurred while trying to ${action} skill for module.`);
    }
  };

  const handleModuleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmittingModule(true);
    setModuleError(null);
    const token = localStorage.getItem('access_token');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    const payload = {
        title: moduleTitle,
        description: moduleDescription,
        order: Number(moduleOrder)
    };
    // Note: associated_skills are managed by handleModuleSkillChange, not in this payload

    try {
        let response;
        const headers = { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
        };

        if (editingModule) {
            response = await fetch(`${backendUrl}/modules/${editingModule.id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(payload),
            });
        } else {
            response = await fetch(`${backendUrl}/courses/${courseId}/modules/`, {
                method: 'POST',
                headers: headers, 
                body: JSON.stringify(payload),
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Failed to ${editingModule ? 'update' : 'create'} module`);
        }
        setShowModuleModal(false);
        fetchCourseAndModules(); 
        alert(`Module ${editingModule ? 'updated' : 'created/details updated'} successfully! Skill associations are saved separately.`);
    } catch (err) {
        if (err instanceof Error) setModuleError(err.message);
        else setModuleError('An unknown error occurred');
    } finally {
        setIsSubmittingModule(false);
    }
  };
  
  const handleDeleteModule = async (moduleIdToDelete: number) => {
    if (!confirm('Are you sure you want to delete this module and all its lessons? This action cannot be undone.')) return;
    
    const token = localStorage.getItem('access_token');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    try {
      const response = await fetch(`${backendUrl}/modules/${moduleIdToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to delete module' }));
        throw new Error(errorData.detail || 'Failed to delete module');
      }
      fetchCourseAndModules(); 
      alert('Module deleted successfully.');
    } catch (err) {
      alert(`Error deleting module: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  if (loading && !courseDetails) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!isAdmin) return <div className="flex justify-center items-center h-screen">Access Denied.</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-500">Error: {error} <Link href="/admin/courses" className="text-blue-500">Go back</Link></div>;
  if (!courseDetails) return <div className="container mx-auto px-4 py-8">Course not found. <Link href="/admin/courses" className="text-blue-500">Go back</Link></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-gray-800">Manage Modules for: {courseDetails.title}</h1>
        <Link href={`/admin/courses/edit/${courseId}`} className="text-sm text-blue-500 hover:text-blue-700">
          &larr; Back to Edit Course
        </Link>
      </div>
      <p className="text-gray-600 mb-6">Course ID: {courseId}</p>

      <button 
        onClick={openNewModuleModal}
        className="mb-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
      >
        Add New Module
      </button>

      {courseDetails.modules.length === 0 ? (
        <p>No modules yet for this course.</p>
      ) : (
        <div className="space-y-4">
          {courseDetails.modules.sort((a,b) => a.order - b.order).map(module => (
            <div key={module.id} className="bg-white p-4 shadow-md rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">{module.title} (Order: {module.order})</h3>
                  <p className="text-sm text-gray-600">{module.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Skills: {module.associated_skills?.map(s => s.name).join(', ') || 'None'}
                  </p>
                </div>
                <div className="space-x-2">
                  <button onClick={() => openEditModuleModal(module)} className="text-sm text-indigo-600 hover:text-indigo-900">Edit Module</button>
                  <button onClick={() => handleDeleteModule(module.id)} className="text-sm text-red-600 hover:text-red-900">Delete Module</button>
                  <Link href={`/admin/modules/${module.id}/lessons`}> 
                     <button className="text-sm text-purple-600 hover:text-purple-900">Manage Lessons ({module.lessons?.length || 0})</button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModuleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg"> {/* Increased max-width for skills */}
            <h2 className="text-2xl font-bold mb-4">{editingModule ? 'Edit Module' : 'Create New Module'}</h2>
            {moduleError && <p className="text-red-500 mb-3">{moduleError}</p>}
            <form onSubmit={handleModuleSubmit}>
              <div className="mb-4">
                <label htmlFor="moduleTitle" className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" id="moduleTitle" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
              </div>
              <div className="mb-4">
                <label htmlFor="moduleDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="moduleDescription" value={moduleDescription} onChange={e => setModuleDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
              </div>
              <div className="mb-4">
                <label htmlFor="moduleOrder" className="block text-sm font-medium text-gray-700">Order</label>
                <input type="number" id="moduleOrder" value={moduleOrder} onChange={e => setModuleOrder(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
              </div>

              {editingModule && (
                <div className="my-4 pt-4 border-t">
                    <h4 className="text-md font-medium text-gray-700 mb-2">Manage Associated Skills for this Module</h4>
                    {skillManagementError && <p className="text-red-500 text-xs mb-2">{skillManagementError}</p>}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="font-semibold mb-1">Available Skills</p>
                            <div className="max-h-32 overflow-y-auto border rounded p-1">
                                {availableSkills.filter(s => !selectedModuleSkills.find(as => as.id === s.id)).map(skill => (
                                    <div key={`avail-mod-${skill.id}`} className="flex justify-between items-center p-1 hover:bg-gray-50">
                                        <span>{skill.name}</span>
                                        <button type="button" onClick={() => handleModuleSkillChange(skill.id, false)} className="text-xs bg-green-400 hover:bg-green-500 text-white py-0.5 px-1.5 rounded">+</button>
                                    </div>
                                ))}
                                {availableSkills.filter(s => !selectedModuleSkills.find(as => as.id === s.id)).length === 0 && <p className="text-xs text-gray-500 p-1">All skills added or none available.</p>}
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold mb-1">Selected Skills for Module</p>
                            <div className="max-h-32 overflow-y-auto border rounded p-1">
                                {selectedModuleSkills.map(skill => (
                                     <div key={`sel-mod-${skill.id}`} className="flex justify-between items-center p-1 hover:bg-gray-50">
                                        <span>{skill.name}</span>
                                        <button type="button" onClick={() => handleModuleSkillChange(skill.id, true)} className="text-xs bg-red-400 hover:bg-red-500 text-white py-0.5 px-1.5 rounded">-</button>
                                    </div>
                                ))}
                                {selectedModuleSkills.length === 0 && <p className="text-xs text-gray-500 p-1">No skills selected.</p>}
                            </div>
                        </div>
                    </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-4">
                <button type="button" onClick={() => setShowModuleModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                <button type="submit" disabled={isSubmittingModule} className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50">
                  {isSubmittingModule ? 'Saving...' : (editingModule ? 'Save Module Details' : 'Create Module')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageCourseModulesPage;
