/* eslint-disable no-unused-vars */
import React from "react";
import { assets } from "../assets/assets.js";

const AdminNavbar = ({ setToken }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <div className="flex items-center">
          <img
            className="w-40 sm:w-36 md:w-40 object-contain"
            src={assets.logo}
            alt="Admin Logo"
          />
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setToken("")}
          className="bg-gray-800 hover:bg-gray-900 active:scale-95 transition-all duration-200 text-white px-4 py-2 sm:px-6 rounded-full text-xs sm:text-sm font-medium"
        >
          Logout
        </button>

      </div>
    </header>
  );
};

export default AdminNavbar;