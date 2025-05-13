import AuthForm from '../components/AuthForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
        </div>
        <AuthForm mode="login" />
        <p className="mt-2 text-center text-sm text-gray-400">
          Or{' '}
          <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
            create a new account
          </Link>
        </p>
      </div>
    </div>
  );
}
