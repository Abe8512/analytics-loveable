
import React from 'react';
import { Link } from 'react-router-dom';

const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">Log in to Future Sentiment Analytics</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
              placeholder="Enter your password"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="mr-2" />
              <label htmlFor="remember" className="text-sm dark:text-gray-300">Remember me</label>
            </div>
            <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</a>
          </div>
          
          <Link to="/">
            <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200">
              Log in
            </button>
          </Link>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm dark:text-gray-300">
            Don't have an account? <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
