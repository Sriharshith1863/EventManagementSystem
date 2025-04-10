import './App.css'
import {BrowserRouter, Route, Routes } from 'react-router-dom';
import {Login, SignUp, Home, MyTickets, Profile, MyEvents} from "./components/index.js";
import { UserProvider } from './contexts/UserContext.js';
import {EventProvider} from './contexts/EventContext.js'
import Layout from './Layout.jsx';
import { useEffect, useState } from 'react';
import Event from './components/Event.jsx';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const allEventDetails = JSON.parse(localStorage.getItem("allEvents"));
  const [allEvents, setAllEvents] = useState(Array.isArray(allEventDetails) ? allEventDetails : []);

  const resetUserDetails = () => {
    setUsername("");
    setIsLoggedIn(false);
  }

  const getUserItems = () => {
    return JSON.parse(localStorage.getItem(username));
  }

  const setUserItems = () => {
    const userdetails = getUserItems();
    localStorage.setItem(username, JSON.stringify({...userdetails, userEvents: events}));
  }
  
  const userDetails = getUserItems();
  const [events, setEvents] = useState(Array.isArray(userDetails?.userEvents) ? userDetails.userEvents : []);  
  useEffect(() => {
    setEvents(Array.isArray(userDetails?.userEvents) ? userDetails.userEvents : []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[isLoggedIn]);

  useEffect(() => {  //TODO: if we have to do any bigger work after adding a event, then may be this can cause problem, because it updates the localStorage after a render cycle
    setUserItems();
    localStorage.setItem("allEvents",JSON.stringify(allEvents));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[events]);

  const createEvent = (event) => {
    const dateNow = Date.now();
    setEvents(prev => [...prev, {eventId: dateNow, ...event}]);
    setAllEvents(prev => [...prev, {eventId: dateNow, ...event}]);
    // setEvents((prev) => (
    //   prev.push({eventId: dateNow, ...event})
    //shouldn't do state mutation
    // ));
    setUserItems();
  }
  return (
    <EventProvider value={{events, createEvent}}>
      <UserProvider value={{username, isLoggedIn, setIsLoggedIn, setUsername, resetUserDetails}}>
        <BrowserRouter> {/*changed from createBrowserRouter to browser router because createbrowser router won't allow dynamic routes, which we want for different event pages*/}
        <Routes>
        <Route path='/' element={<Layout />}>
          <Route path='' element={
            <div className="flex flex-col md:flex-row w-full gap-8 p-6 bg-gray-900 min-h-[80vh] items-center justify-center relative overflow-hidden">
              {/* Background decorative elements */}
              <div className="absolute top-10 left-10 w-32 h-32 bg-purple-600/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-xl"></div>
              <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-indigo-600/5 rounded-full blur-lg"></div>
              
              {/* Content container */}
              <div className="z-10 flex flex-col md:flex-row gap-8 w-full max-w-8xl">
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Event Management System</h1>
                  <p className="text-gray-300 text-center mb-6">Your complete solution for event planning, ticketing, and management. Sign in to get started.</p>
                  <div className="w-full">
                    <Login type="org" />
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                  <h2 className="text-2xl font-semibold text-white mb-4 text-center">Attending an Event?</h2>
                  <p className="text-gray-300 text-center mb-6">Log in to access your tickets, view upcoming events, and manage your profile.</p>
                  <div className="w-full">
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
              <div className="z-10 flex flex-col md:flex-row gap-8 w-full max-w-8xl">
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Create an Account</h1>
                  <p className="text-gray-300 text-center mb-6">Register as an event organizer to create and manage your own events.</p>
                  <div className="w-full">
                    <SignUp type="org" />
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                  <h2 className="text-2xl font-semibold text-white mb-4 text-center">Attendee Registration</h2>
                  <p className="text-gray-300 text-center mb-6">Sign up to discover events, purchase tickets, and join the community.</p>
                  <div className="w-full">
                    <SignUp type="usr" />
                  </div>
                </div>
              </div>
            </div>
            } />
          <Route path='home' element={<Home eventsToRender={allEvents} />} />
          <Route path='myTickets' element={<MyTickets />} />
          <Route path='profile' element={<Profile />}/>
          <Route path="myevents" element={<MyEvents />} />
          <Route path="events/:creator/:eventId" element={<Event eventsToSearch={allEvents} />} />
        </Route>
        </Routes>
        </BrowserRouter>
      </UserProvider>
    </EventProvider>
  )
}

export default App