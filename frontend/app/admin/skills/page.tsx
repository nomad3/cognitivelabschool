// frontend/app/admin/skills/page.tsx
"use client";

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Skill {
  id: number;
  name: string;
  description: string | null;
}

const AdminSkillsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState<string | null>(null);

  // States for modal
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillName, setSkillName] = useState('');
  const [skillDescription, setSkillDescription] = useState('');
  const [skillModalError, setSkillModalError] = useState<string | null>(null);
  const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);

  const fetchSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/admin/skills/?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch skills' }));
        throw new Error(errorData.detail || 'Failed to fetch skills');
      }
      const data: Skill[] = await response.json();
      setSkills(data);
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
    if (adminStatus !== 'true') {
      router.push('/');
      return;
    }
    setIsAdminUser(true);
    fetchSkills();
  }, [router]);

  const openNewSkillModal = () => {
    setEditingSkill(null);
    setSkillName('');
    setSkillDescription('');
    setSkillModalError(null);
    setShowSkillModal(true);
  };

  const openEditSkillModal = (skill: Skill) => {
    setEditingSkill(skill);
    setSkillName(skill.name);
    setSkillDescription(skill.description || '');
    setSkillModalError(null);
    setShowSkillModal(true);
  };

  const handleSkillSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmittingSkill(true);
    setSkillModalError(null);
    const token = localStorage.getItem('access_token');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    const payload = {
      name: skillName,
      description: skillDescription,
    };
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    let url = `${backendUrl}/admin/skills/`;
    let method = 'POST';

    if (editingSkill) {
      url = `${backendUrl}/admin/skills/${editingSkill.id}`;
      method = 'PUT';
    }

    try {
      const response = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to ${editingSkill ? 'update' : 'create'} skill`);
      }
      setShowSkillModal(false);
      fetchSkills(); // Refresh list
      alert(`Skill ${editingSkill ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      if (err instanceof Error) setSkillModalError(err.message);
      else setSkillModalError('An unknown error occurred');
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    
    const token = localStorage.getItem('access_token');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    try {
      const response = await fetch(`${backendUrl}/admin/skills/${skillId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to delete skill' }));
        throw new Error(errorData.detail || 'Failed to delete skill');
      }
      fetchSkills(); // Refresh
      alert('Skill deleted successfully.');
    } catch (err) {
      alert(`Error deleting skill: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading skills...</div>;
  if (!isAdminUser) return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
      <p className="text-xl text-red-500">Access Denied.</p>
      <p className="text-gray-300">You do not have permission to view this page.</p>
    </div>
  );
  if (error) return <div className="min-h-screen bg-gray-900 text-white py-8 container mx-auto px-4 text-red-400">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-orange-400">Manage Skills</h1>
          <div className="space-x-4">
              <button 
                  onClick={openNewSkillModal}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors shadow-md hover:shadow-lg"
              >
                  Add New Skill
              </button>
              <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 font-semibold py-2 px-4 rounded transition-colors flex items-center inline-flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H15a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                  Back to Admin Dashboard
              </Link>
          </div>
        </div>

        {skills.length === 0 ? (
          <p className="text-center text-gray-400 text-lg">No skills defined yet. Click "Add New Skill" to get started.</p>
        ) : (
          <div className="bg-gray-800 shadow-xl rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{skill.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{skill.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate" title={skill.description || ''}>{skill.description || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => openEditSkillModal(skill)} className="text-indigo-400 hover:text-indigo-300 mr-4 font-semibold">Edit</button>
                      <button onClick={() => handleDeleteSkill(skill.id)} className="text-red-500 hover:text-red-400 font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Skill Create/Edit Modal */}
        {showSkillModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-indigo-400">{editingSkill ? 'Edit Skill' : 'Create New Skill'}</h2>
              {skillModalError && <div className="mb-4 text-red-400 bg-red-900/30 border border-red-700 p-3 rounded-md">{skillModalError}</div>}
              <form onSubmit={handleSkillSubmit} className="space-y-6">
                <div>
                  <label htmlFor="skillName" className="block text-sm font-medium text-gray-300">Name</label>
                  <input type="text" id="skillName" value={skillName} onChange={e => setSkillName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white"/>
                </div>
                <div>
                  <label htmlFor="skillDescription" className="block text-sm font-medium text-gray-300">Description</label>
                  <textarea id="skillDescription" value={skillDescription} onChange={e => setSkillDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white"/>
                </div>
                <div className="flex justify-end space-x-4 pt-2">
                  <button type="button" onClick={() => setShowSkillModal(false)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmittingSkill} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmittingSkill ? 'Saving...' : (editingSkill ? 'Save Changes' : 'Create Skill')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSkillsPage;
