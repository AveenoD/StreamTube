import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm.jsx';
import RegisterForm from './RegisterForm.jsx';
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Streamify</h1>
            </div>

            <div className="flex border border-gray-200 rounded-lg mb-6 overflow-hidden">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 font-medium ${isLogin ? 'bg-red-50 text-red-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 font-medium ${!isLogin ? 'bg-red-50 text-red-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {isLogin ? (
              <LoginForm 
                isLoading={isLoading} 
                setIsLoading={setIsLoading} 
                setError={setError}
                navigate={navigate}
              />
            ) : (
              <RegisterForm 
                isLoading={isLoading} 
                setIsLoading={setIsLoading} 
                setError={setError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;