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

  if (loading) return <div className="flex justify-center items-center h-screen">Loading skills...</div>;
  if (!isAdminUser) return <div className="flex justify-center items-center h-screen">Access Denied.</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Skills</h1>
        <div className="space-x-3">
            <button 
                onClick={openNewSkillModal}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
                Add New Skill
            </button>
            <Link href="/admin" className="text-sm text-blue-500 hover:text-blue-700">
                &larr; Back to Admin Dashboard
            </Link>
        </div>
      </div>

      {skills.length === 0 ? (
        <p>No skills defined yet.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {skills.map((skill) => (
                <tr key={skill.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{skill.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{skill.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{skill.description || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openEditSkillModal(skill)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button onClick={() => handleDeleteSkill(skill.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Skill Create/Edit Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editingSkill ? 'Edit Skill' : 'Create New Skill'}</h2>
            {skillModalError && <p className="text-red-500 mb-3">{skillModalError}</p>}
            <form onSubmit={handleSkillSubmit}>
              <div className="mb-4">
                <label htmlFor="skillName" className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" id="skillName" value={skillName} onChange={e => setSkillName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
              </div>
              <div className="mb-6">
                <label htmlFor="skillDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="skillDescription" value={skillDescription} onChange={e => setSkillDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowSkillModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                <button type="submit" disabled={isSubmittingSkill} className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50">
                  {isSubmittingSkill ? 'Saving...' : (editingSkill ? 'Save Changes' : 'Create Skill')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSkillsPage;
