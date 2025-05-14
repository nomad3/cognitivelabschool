// frontend/app/admin/users/page.tsx
"use client";

import React, { useEffect, useState, FormEvent } from 'react'; // Added FormEvent
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
}

const AdminUsersPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false); 
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  // States for editing a user
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFullName, setUserFullName] = useState('');
  const [userIsActive, setUserIsActive] = useState(false);
  const [userIsAdminFlag, setUserIsAdminFlag] = useState(false); // Different name to avoid conflict
  const [userEditError, setUserEditError] = useState<string | null>(null);
  const [isSubmittingUserUpdate, setIsSubmittingUserUpdate] = useState(false);

  const fetchUsers = async () => {
    // Moved fetchUsers to be callable for refresh
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/admin/users/?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: 'Failed to fetch users'}));
        throw new Error(errorData.detail || 'Failed to fetch users');
      }
      const data: User[] = await response.json();
      setUsers(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
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
      router.push('/'); // Redirect non-admins to home
      return;
    }
    setIsAdminUser(true);

    fetchUsers();
  }, [router]); // fetchUsers is stable, so router is the main dep here for auth check

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setUserFullName(user.full_name || '');
    setUserIsActive(user.is_active);
    setUserIsAdminFlag(user.is_admin);
    setUserEditError(null);
    setShowUserEditModal(true);
  };

  const handleUserUpdateSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingUser) return;

    setIsSubmittingUserUpdate(true);
    setUserEditError(null);
    const token = localStorage.getItem('access_token');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    const payload: { full_name?: string; is_active?: boolean; is_admin?: boolean } = {};
    if (userFullName !== editingUser.full_name) payload.full_name = userFullName;
    if (userIsActive !== editingUser.is_active) payload.is_active = userIsActive;
    if (userIsAdminFlag !== editingUser.is_admin) payload.is_admin = userIsAdminFlag;

    // Only send request if there's something to update
    if (Object.keys(payload).length === 0) {
        setShowUserEditModal(false);
        setIsSubmittingUserUpdate(false);
        return;
    }

    try {
      const response = await fetch(`${backendUrl}/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update user');
      }
      setShowUserEditModal(false);
      fetchUsers(); // Refresh the list
      alert('User updated successfully!');
    } catch (err) {
      if (err instanceof Error) setUserEditError(err.message);
      else setUserEditError('An unknown error occurred');
    } finally {
      setIsSubmittingUserUpdate(false);
    }
  };


  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading users...</div>;
  }

  if (!isAdminUser) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
        <p className="text-xl text-red-500">Access Denied.</p>
        <p className="text-gray-300">You do not have permission to view this page.</p>
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-red-400">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-green-400">Manage Users</h1>
          <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 font-semibold py-2 px-4 rounded transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H15a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Admin Dashboard
          </Link>
        </div>

        {users.length === 0 ? (
          <p className="text-center text-gray-400 text-lg">No users found.</p>
        ) : (
          <div className="bg-gray-800 shadow-xl rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Full Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Active</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Admin</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.full_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>
                        {user.is_active ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_admin ? 'bg-indigo-700 text-indigo-100' : 'bg-gray-600 text-gray-200'}`}>
                        {user.is_admin ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                          onClick={() => openEditUserModal(user)}
                          className="text-indigo-400 hover:text-indigo-300 mr-4 font-semibold"
                      >
                          Edit
                      </button>
                      <button className="text-red-500 hover:text-red-400 font-semibold disabled:opacity-50 disabled:cursor-not-allowed" disabled>Delete</button> {/* Delete User not implemented yet */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* User Edit Modal */}
      {showUserEditModal && editingUser && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-indigo-400">Edit User: <span className="text-gray-300">{editingUser.email}</span></h2>
              {userEditError && <div className="mb-4 text-red-400 bg-red-900/30 border border-red-700 p-3 rounded-md">{userEditError}</div>}
              <form onSubmit={handleUserUpdateSubmit} className="space-y-6">
                <div>
                  <label htmlFor="userFullName" className="block text-sm font-medium text-gray-300">Full Name</label>
                  <input 
                      type="text" 
                      id="userFullName" 
                      value={userFullName} 
                      onChange={e => setUserFullName(e.target.value)} 
                      className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white"
                  />
                </div>
                
                <div className="flex items-center">
                    <input 
                        id="userIsActive" 
                        type="checkbox" 
                        checked={userIsActive} 
                        onChange={e => setUserIsActive(e.target.checked)}
                        className="h-4 w-4 text-indigo-500 border-gray-600 rounded focus:ring-indigo-500 bg-gray-700 focus:ring-offset-gray-800"
                    />
                    <label htmlFor="userIsActive" className="ml-2 block text-sm text-gray-300">Active</label>
                </div>

                <div className="flex items-center">
                    <input 
                        id="userIsAdminFlag" 
                        type="checkbox" 
                        checked={userIsAdminFlag} 
                        onChange={e => setUserIsAdminFlag(e.target.checked)}
                        className="h-4 w-4 text-indigo-500 border-gray-600 rounded focus:ring-indigo-500 bg-gray-700 focus:ring-offset-gray-800"
                    />
                    <label htmlFor="userIsAdminFlag" className="ml-2 block text-sm text-gray-300">Admin</label>
                </div>

                <div className="flex justify-end space-x-4 pt-2">
                  <button type="button" onClick={() => setShowUserEditModal(false)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmittingUserUpdate} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmittingUserUpdate ? 'Saving...' : 'Save Changes'}
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

export default AdminUsersPage;
