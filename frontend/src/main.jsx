import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from './layout/LoginPage';
import RegisterPage from './layout/RegisterPage';
import Dashboard from './pages/Dashboard';
import { ToastProvider } from './toaster/ToastContext';
import { ToastContainer  } from './toaster/ToastContainer';
const router = createBrowserRouter([
  {
    path:'/login',
    element: <LoginPage />
  },
  {
    path:'/register',
    element: <RegisterPage />
  },
  {
    path:'/',
    element: <App />,
    children:[
      {
        path:'dashboard',
        element: <Dashboard />
      }
    ]
  }
]);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
   <ToastProvider>              
      <RouterProvider router={router} />
      <ToastContainer />          
    </ToastProvider>
  </React.StrictMode>
);