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
    return <div className="flex justify-center items-center h-screen">Loading users...</div>;
  }

  if (!isAdminUser) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-xl text-red-500">Access Denied.</p>
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
        <Link href="/admin" className="text-sm text-blue-500 hover:text-blue-700">
            &larr; Back to Admin Dashboard
        </Link>
      </div>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_admin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.is_admin ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                        onClick={() => openEditUserModal(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                        Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900 disabled:opacity-50" disabled>Delete</button> {/* Delete User not implemented yet */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    {/* User Edit Modal */}
    {showUserEditModal && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit User: {editingUser.email}</h2>
            {userEditError && <p className="text-red-500 mb-3">{userEditError}</p>}
            <form onSubmit={handleUserUpdateSubmit}>
              <div className="mb-4">
                <label htmlFor="userFullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input 
                    type="text" 
                    id="userFullName" 
                    value={userFullName} 
                    onChange={e => setUserFullName(e.target.value)} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1 flex items-center">
                    <input 
                        id="userIsActive" 
                        type="checkbox" 
                        checked={userIsActive} 
                        onChange={e => setUserIsActive(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="userIsActive" className="ml-2 block text-sm text-gray-900">Active</label>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <div className="mt-1 flex items-center">
                    <input 
                        id="userIsAdminFlag" 
                        type="checkbox" 
                        checked={userIsAdminFlag} 
                        onChange={e => setUserIsAdminFlag(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="userIsAdminFlag" className="ml-2 block text-sm text-gray-900">Admin</label>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowUserEditModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                <button type="submit" disabled={isSubmittingUserUpdate} className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50">
                  {isSubmittingUserUpdate ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
