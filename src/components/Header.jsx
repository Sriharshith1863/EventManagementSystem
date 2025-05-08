import React from 'react'
import { NavLink } from 'react-router-dom'
import { useUserContext } from '../contexts';
function Header() {
  const {isLoggedIn, username, resetUserDetails} = useUserContext();
  const isUser = (username.substring(username.length-3) == 'usr');
  return (
    <header className="bg-gray-900 text-green-700 flex justify-between p-4 text-2xl">
        <h1 className="">Evnt</h1>
        <nav className="flex gap-x-12 mx-4">
            <NavLink to="/home" className={({isActive}) => `${isActive? "text-purple-500" : "text-green-700"}`}>Home</NavLink>
            <NavLink to='/myTickets' className={({isActive}) => `${isActive? "text-purple-500" : "text-green-700"} ${(isLoggedIn && isUser)?"": "hidden" }`}>My tickets</NavLink>
            <NavLink to='/myEvents' className={({isActive}) => `${isActive? "text-purple-500" : "text-green-700"} ${(isLoggedIn && !isUser)? "": "hidden" }`}>My Events</NavLink>
            <NavLink to='/profile' className={({isActive}) => `${isActive? "text-purple-500" : "text-green-700"} ${isLoggedIn? "": "hidden" }`}>Profile</NavLink>
            <NavLink to="/" className={({isActive}) => `${isActive? "text-purple-500" : "text-green-700"} ${isLoggedIn? "hidden": "" }`}>Login</NavLink>
            {/* <NavLink to="/signUp" className={({isActive}) => `${isActive? "text-purple-500" : "text-green-700"} ${isLoggedIn? "hidden": "" }`}>Sign Up</NavLink> */}
            <NavLink to="/" className={({isActive}) => `${isActive? "text-purple-500" : "text-green-700"} ${isLoggedIn? "": "hidden" }`} onClick={resetUserDetails}>Logout</NavLink>
        </nav>
    </header>
  )
}

export default Header