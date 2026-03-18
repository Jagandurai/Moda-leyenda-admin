/* eslint-disable no-unused-vars */
import React from 'react'
import { NavLink } from "react-router-dom"
import { assets } from '../assets/assets'

const Sidebar = () => {
  return (
    <>
      {/* Vertical Sidebar for medium and larger screens */}
      <div className="hidden md:flex md:flex-col w-[18%] min-h-screen border-r-2 p-4 gap-4">

        <NavLink 
          className={({isActive}) => `flex items-center gap-3 border border-gray-300 px-3 py-2 rounded-l ${isActive ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          to="/add"
        >
          <img className='w-5 h-5' src={assets.add_icon} alt="Add Items" />
          <p>Add Items</p>
        </NavLink>

        <NavLink 
          className={({isActive}) => `flex items-center gap-3 border border-gray-300 px-3 py-2 rounded-l ${isActive ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          to="/list"
        >
          <img className='w-5 h-5' src={assets.order_icon} alt="List Items" />
          <p>List Items</p>
        </NavLink>

        <NavLink 
          className={({isActive}) => `flex items-center gap-3 border border-gray-300 px-3 py-2 rounded-l ${isActive ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          to="/orders"
        >
          <img className='w-5 h-5' src={assets.Orders_icon} alt="Orders" />
          <p>Orders</p>
        </NavLink>

        {/* ✅ CATEGORY MENU */}
        <NavLink 
          className={({isActive}) => `flex items-center gap-3 border border-gray-300 px-3 py-2 rounded-l ${isActive ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          to="/category"
        >
          <img className='w-5 h-5' src={assets.Category_icon} alt="Category" />
          <p>Category</p>
        </NavLink>

      </div>

      {/* Horizontal Bottom Navbar for small screens */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 shadow-inner z-50 md:hidden">
        <div className="flex justify-around items-center py-2 text-[14px]">

          <NavLink 
            className={({isActive}) => 
              `flex flex-col items-center gap-1 px-4 py-2 rounded-t ${isActive ? 'bg-gray-200' : 'hover:bg-gray-100'}`
            } 
            to="/add"
          >
            <img className='w-6 h-6' src={assets.add_icon} alt="Add Items" />
            <p className='text-xs'>Add</p>
          </NavLink>

          <NavLink 
            className={({isActive}) => 
              `flex flex-col items-center gap-1 px-4 py-2 rounded-t ${isActive ? 'bg-gray-200' : 'hover:bg-gray-100'}`
            } 
            to="/list"
          >
            <img className='w-6 h-6' src={assets.order_icon} alt="List Items" />
            <p className='text-xs'>List</p>
          </NavLink>

          <NavLink 
            className={({isActive}) => 
              `flex flex-col items-center gap-1 px-4 py-2 rounded-t ${isActive ? 'bg-gray-200' : 'hover:bg-gray-100'}`
            } 
            to="/orders"
          >
            <img className='w-6 h-6' src={assets.Orders_icon} alt="Orders" />
            <p className='text-xs'>Orders</p>
          </NavLink>

          {/* ✅ CATEGORY MOBILE */}
          <NavLink 
            className={({isActive}) => 
              `flex flex-col items-center gap-1 px-4 py-2 rounded-t ${isActive ? 'bg-gray-200' : 'hover:bg-gray-100'}`
            } 
            to="/category"
          >
            <img className='w-6 h-6' src={assets.Category_icon} alt="Category" />
            <p className='text-xs'>Category</p>
          </NavLink>

        </div>
      </div>
    </>
  )
}

export default Sidebar;