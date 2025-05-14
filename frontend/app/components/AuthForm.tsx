"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link for navigation

// It's good practice to import icons if you use them, e.g., from a library like react-icons
// For simplicity, we'll use text for now: [Show]/[Hide]

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Use relative paths for API calls to leverage Next.js rewrites
    const endpoint = mode === 'register' ? '/api/users/' : '/api/token';
    
    let body;
    let headers: HeadersInit = { 'Content-Type': 'application/json' };

    if (mode === 'login') {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      body = formData;
      headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    } else {
      body = JSON.stringify({ email, password });
    }

    try {
      const res = await fetch(endpoint, { // Use relative endpoint directly
        method: 'POST',
        headers: headers,
        body: body,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Failed to ${mode}`);
      }

      const data = await res.json();

      if (mode === 'login') {
        // Store the token (e.g., in localStorage or context)
        localStorage.setItem('accessToken', data.access_token); // Standardize to camelCase 'accessToken'
        localStorage.setItem('isAdmin', data.is_admin ? 'true' : 'false'); // Store is_admin status as string
        // Redirect to a protected page or dashboard
        router.push('/'); // Or a dashboard page
      } else {
        // Redirect to login page after successful registration
        router.push('/login');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`An unknown error occurred during ${mode}.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password"className="block text-sm font-medium text-gray-300">
          Password
        </label>
        <div className="mt-1 relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white pr-10" // Added pr-10 for button space
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-gray-400 hover:text-gray-200"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {error && (
        <div>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : mode === 'login' ? 'Sign in' : 'Register'}
        </button>
      </div>

      <div className="text-sm text-center">
        {mode === 'login' ? (
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
              Register
            </Link>
          </p>
        ) : (
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}
