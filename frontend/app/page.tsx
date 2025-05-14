"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Added for potential redirects

// Icons (simple placeholders, consider using a library like Heroicons or React Icons)
const IconPlaceholder = ({ className = "w-12 h-12 text-indigo-400" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m0 0A8.001 8.001 0 004 12a8.001 8.001 0 008 8.247zM12 6.253c0-1.657 1.343-3 3-3s3 1.343 3 3c0 1.657-1.343 3-3 3s-3-1.343-3-3zm0 0c0-1.657-1.343-3-3-3s-3 1.343-3 3c0 1.657 1.343 3 3 3s3-1.343 3-3z"></path>
  </svg>
);


export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null); // To display user info
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
      // You might want to decode the token to get user info or fetch it from a /me endpoint
      // For now, let's assume email could be stored or fetched.
      // This is a placeholder for actual user data retrieval.
      const storedEmail = localStorage.getItem('userEmail'); // Example
      if (storedEmail) setUserEmail(storedEmail);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userEmail'); // Clear example user email
    setIsAuthenticated(false);
    setUserEmail(null);
    router.push('/'); // Refresh or redirect to ensure state update
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Bar */}
      <nav className="bg-gray-800/30 backdrop-blur-md shadow-lg fixed w-full z-50 top-0">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            CognitiveLabsSchool
          </Link>
          <div className="space-x-4 flex items-center">
            <Link href="/courses" className="text-gray-300 hover:text-indigo-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Courses
            </Link>
            {/* Placeholder Links */}
            {/* <Link href="/about" className="text-gray-300 hover:text-indigo-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">About Us</Link> */}
            {/* <Link href="/contact" className="text-gray-300 hover:text-indigo-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">Contact</Link> */}
            
            {isAuthenticated ? (
              <>
                {localStorage.getItem('isAdmin') === 'true' && (
                   <Link href="/admin" className="text-gray-300 hover:text-indigo-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                     Admin
                   </Link>
                )}
                <Link href="/study-plan" className="text-gray-300 hover:text-indigo-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Study Plan
                </Link>
                {/* {userEmail && <span className="text-sm text-gray-400">Welcome, {userEmail}!</span>} */}
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 bg-indigo-600 hover:bg-indigo-700 transition-colors px-4 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link href="/register" className="text-gray-900 bg-green-500 hover:bg-green-600 transition-colors px-4 py-2 rounded-md text-sm font-medium">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-16 md:pt-48 md:pb-24 bg-gradient-to-b from-gray-900 via-gray-800/50 to-gray-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Subtle background pattern or animation could go here */}
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
              Unlock Your AI Potential.
            </span>
            <span className="block mt-2 md:mt-3">Transform Your Career.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            CognitiveLabsSchool empowers professionals and organizations to master Artificial Intelligence. 
            Dive into our personalized, adaptive learning experience and stay ahead in the AI-driven world.
          </p>
          <div className="space-x-0 space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center">
            <Link href="/courses" className="w-full sm:w-auto inline-block px-8 py-4 text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg transition-transform transform hover:scale-105">
              Browse Courses
            </Link>
            <Link href="/register" className="w-full sm:w-auto inline-block px-8 py-4 text-lg font-semibold text-indigo-400 bg-gray-700 hover:bg-gray-600 rounded-lg shadow-lg transition-transform transform hover:scale-105">
              Get Started Free
            </Link>
          </div>
        </div>
        {/* Decorative shapes */}
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-r from-indigo-500/20 to-purple-500/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"></div>
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-l from-pink-500/20 to-purple-500/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slower"></div>
      </header>

      {/* Key Features Section */}
      <section className="py-16 md:py-24 bg-gray-800/40">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-indigo-400">Why CognitiveLabsSchool?</h2>
          <p className="text-center text-gray-400 mb-12 md:mb-16 max-w-2xl mx-auto">
            We're not just another online course platform. We're your partners in AI mastery, offering a unique blend of cutting-edge content and proven learning science.
          </p>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl hover:shadow-indigo-500/30 transition-shadow duration-300">
              <div className="flex justify-center mb-4"><IconPlaceholder /></div>
              <h3 className="text-xl font-semibold mb-3 text-center text-green-400">Personalized Learning Paths</h3>
              <p className="text-gray-400 text-center">Our AI adapts to your skill level and learning style, creating a unique journey just for you. Maximize your potential with tailored content and recommendations.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl hover:shadow-indigo-500/30 transition-shadow duration-300">
              <div className="flex justify-center mb-4"><IconPlaceholder /></div>
              <h3 className="text-xl font-semibold mb-3 text-center text-blue-400">Expert-Led, Practical Courses</h3>
              <p className="text-gray-400 text-center">Learn from industry veterans with hands-on projects and real-world applications. Gain skills you can immediately apply to your work.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl hover:shadow-indigo-500/30 transition-shadow duration-300">
              <div className="flex justify-center mb-4"><IconPlaceholder /></div>
              <h3 className="text-xl font-semibold mb-3 text-center text-purple-400">Career Advancement Focus</h3>
              <p className="text-gray-400 text-center">We're committed to helping you achieve your career goals. Our curriculum is designed to equip you with the most in-demand AI skills.</p>
            </div>
          </div>
        </div>
      </section>

      {/* "Why Choose Us?" / Mission Section */}
      <section className="py-16 md:py-24 bg-gray-900">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
            {/* Placeholder for an image or illustration */}
            <div className="bg-gray-800 rounded-lg shadow-xl w-full h-80 flex items-center justify-center">
              <Image src="/globe.svg" alt="Abstract illustration" width={150} height={150} className="opacity-50" />
            </div>
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              Cultivating AI Thinkers & Problem-Solvers
            </h2>
            <p className="text-gray-300 text-lg mb-4">
              At CognitiveLabsSchool, we believe in making learning engaging, accessible, and deeply personalized. 
              Inspired by proven pedagogical methods like Kumon and Montessori, we focus on identifying and maximizing 
              individual student skillsets to foster true mastery and application of AI.
            </p>
            <p className="text-gray-400 mb-6">
              Our mission is to enhance productivity, drive efficiency, and ensure your workforce remains at the competitive vanguard. 
              We provide a B2B solution offering a dynamic curriculum tailored for diverse expertise levels—from AI novices to seasoned practitioners.
            </p>
            <Link href="/courses" className="inline-block px-8 py-3 text-lg font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
              Explore Our Curriculum
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials Placeholder */}
      <section className="py-16 md:py-24 bg-gray-800/40">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-indigo-400">Loved by Professionals Worldwide</h2>
          <p className="text-gray-500 italic">(Testimonials coming soon...)</p>
          {/* Grid for testimonials would go here */}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-t from-gray-900 via-gray-800/50 to-gray-900 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Ready to Begin Your AI Journey?</h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-xl mx-auto mb-10">
            Join thousands of professionals who are upskilling with CognitiveLabsSchool. 
            Your future in AI starts now.
          </p>
          <Link href="/register" className="inline-block px-10 py-4 text-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xl transition-transform transform hover:scale-105">
            Sign Up For Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p className="mb-2">&copy; {new Date().getFullYear()} CognitiveLabsSchool. All rights reserved.</p>
          <div className="space-x-4">
            {/* <Link href="/privacy" className="hover:text-indigo-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-indigo-400">Terms of Service</Link> */}
            {/* Social media links placeholder */}
          </div>
        </div>
      </footer>
    </div>
  );
}
