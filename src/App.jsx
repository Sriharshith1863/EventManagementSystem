// import './App.css'
// import {Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
// import {Login, SignUp, Home, MyTickets, Profile, MyEvents} from "./components/index.js";
// import { UserProvider } from './contexts/UserContext.js';
// import Layout from './Layout.jsx';
// import { useState } from 'react';
// const router = createBrowserRouter(
//   createRoutesFromElements(  
//     <Route path='/' element={<Layout />}>
//       <Route path='' element={
//         <div className="flex w-full">
//           <Login type="org" />
//           <Login type="usr" />
//         </div>
//         } />
//       <Route path='signUp' element={
//         <div className="flex w-full">
//           <SignUp type="org" />
//           <SignUp type="usr" />
//         </div>
//         } />
//       <Route path='home' element={<Home />} />
//       <Route path='myTickets' element={<MyTickets />} />
//       <Route path='profile' element={<Profile />}/>
//       <Route path="/myevents" element={<MyEvents />} />
//     </Route>
//   )
// )
// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [username, setUsername] = useState("");
//   return (
//     <UserProvider value={{username, isLoggedIn, setIsLoggedIn, setUsername}}>
//     <RouterProvider router={router} />
//     </UserProvider>
//   )
// }

// export default App


import './App.css'
import {Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import {Login, SignUp, Home, MyTickets, Profile, MyEvents} from "./components/index.js";
import { UserProvider } from './contexts/UserContext.js';
import Layout from './Layout.jsx';
import { useState } from 'react';
const router = createBrowserRouter(
  createRoutesFromElements(  
    <Route path='/' element={<Layout />}>
      <Route path='' element={
        <div className="flex flex-col md:flex-row w-full gap-8 p-6 bg-gray-900 min-h-[80vh] items-center justify-center relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-600/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-indigo-600/5 rounded-full blur-lg"></div>
          
          {/* Content container */}
          <div className="z-10 flex flex-col md:flex-row gap-8 w-full max-w-5xl">
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Event Management System</h1>
              <p className="text-gray-300 text-center mb-6 max-w-md">Your complete solution for event planning, ticketing, and management. Sign in to get started.</p>
              <div className="w-full max-w-md">
                <Login type="org" />
              </div>
            </div>
            
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold text-white mb-4 text-center">Attending an Event?</h2>
              <p className="text-gray-300 text-center mb-6 max-w-md">Log in to access your tickets, view upcoming events, and manage your profile.</p>
              <div className="w-full max-w-md">
                <Login type="usr" />
              </div>
            </div>
          </div>
        </div>
        } />
      <Route path='signUp' element={
        <div className="flex flex-col md:flex-row w-full gap-8 p-6 bg-gray-900 min-h-[80vh] items-center justify-center relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-indigo-600/5 rounded-full blur-lg"></div>
          
          {/* Content container */}
          <div className="z-10 flex flex-col md:flex-row gap-8 w-full max-w-5xl">
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Create an Account</h1>
              <p className="text-gray-300 text-center mb-6 max-w-md">Register as an event organizer to create and manage your own events.</p>
              <div className="w-full max-w-md">
                <SignUp type="org" />
              </div>
            </div>
            
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold text-white mb-4 text-center">Attendee Registration</h2>
              <p className="text-gray-300 text-center mb-6 max-w-md">Sign up to discover events, purchase tickets, and join the community.</p>
              <div className="w-full max-w-md">
                <SignUp type="usr" />
              </div>
            </div>
          </div>
        </div>
        } />
      <Route path='home' element={<Home />} />
      <Route path='myTickets' element={<MyTickets />} />
      <Route path='profile' element={<Profile />}/>
      <Route path="/myevents" element={<MyEvents />} />
    </Route>
  )
)
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  return (
    <UserProvider value={{username, isLoggedIn, setIsLoggedIn, setUsername}}>
    <RouterProvider router={router} />
    </UserProvider>
  )
}

export default App