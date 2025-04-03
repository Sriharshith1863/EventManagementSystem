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
        <div className="flex w-full">
          <Login type="org" />
          <Login type="usr" />
        </div>
        } />
      <Route path='signUp' element={
        <div className="flex w-full">
          <SignUp type="org" />
          <SignUp type="usr" />
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
