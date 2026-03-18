/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AdminNavbar from './components/AdminNavbar'
import Sidebar from './components/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import AddProduct from './pages/AddProduct'
import ListProduct from './pages/ListProduct'
import Orders from "./pages/Orders"
import Category from './pages/Category'
import Login from './components/Login'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {

  const [token, setToken] = useState(
    localStorage.getItem('token') || ''
  );

  // Save token
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // 🔥 Attach token automatically to every request
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message;

        if (message === "jwt expired") {
          toast.error("Session expired. Please login again.");
          setToken('');
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };

  }, []);

  return (
    <div className='bg-gray-100 min-h-screen w-full'>
      <ToastContainer />

      {token === '' ? (
        <Login setToken={setToken} />
      ) : (
        <div className="flex flex-col min-h-screen">

          <AdminNavbar setToken={setToken} />

          <div className='flex flex-1 w-full pt-16'>

            <Sidebar />

            <main className='flex-1 w-full p-4 sm:p-6 lg:p-8 
                              text-gray-600 text-base 
                              overflow-x-hidden 
                              pb-20 md:pb-8'>

              <Routes>

                <Route path="/" element={<Navigate to="/add" replace />} />
                <Route path="/add" element={<AddProduct />} />
                <Route path="/list" element={<ListProduct />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/category" element={<Category />} />
                <Route path="*" element={<Navigate to="/add" replace />} />

              </Routes>

            </main>

          </div>
        </div>
      )}
    </div>
  )
}

export default App