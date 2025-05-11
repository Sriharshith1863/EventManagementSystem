import './App.css'
import {BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import {Login, SignUp, Home, MyTickets, Profile, MyEvents} from "./components/index.js";
import { UserProvider } from './contexts/UserContext.js';
import {EventProvider} from './contexts/EventContext.js'
import Layout from './Layout.jsx';
import { useEffect, useState } from 'react';
import Event from './components/Event.jsx';
import ParticipantList from './components/ParticipantList.jsx';
import MyTicketsView from './components/MyTicketsView.jsx';
import LoginChoice from './components/LoginChoice.jsx';
import { TicketProvider } from './contexts/TicketContext.js';
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  //const launchedEventsDetails = JSON.parse(localStorage.getItem("launchedEvents"));
  const [launchedEvents, setLaunchedEvents] = useState([]);
  
  const resetUserDetails = async () => {
    try {
      await fetch(`http://localhost:3000/api/logout`,
      {
        method: 'POST',
        credentials: 'include'
      }
    );
    setUsername("");
    setIsLoggedIn(false);
    } catch (error) {
      console.log("unable to logout user", error);
      throw new Error("unable to logout user");
    }

  }
  // const getUserItems = () => {

  //   return JSON.parse(localStorage.getItem(username));
  // }
  
  const [events, setEvents] = useState([]);

  // useEffect(() => {
  //   const checkUser = async () => {
  //     try {
  //       const resp1 = await fetch(`http://localhost:3000/api/home`,
  //         {
  //           method: 'GET',
  //         }
  //       );
  //       const resp3 = await resp1.json();
  //       const response3 = resp3.map(event => ({
  //           eventId: event.event_id,
  //           eventName: event.name,
  //           venue: event.venue,
  //           dateTime: event.datetime,
  //           organizerName: event.organizer,
  //           description: event.description,
  //           cost: event.cost,
  //           contact1: event.contact1,
  //           contact2: event.contact2,
  //           organiserEmailId: event.email,
  //           eventLaunched: event.event_launched,
  //           eventCreator: event.organizer_username,
  //           imageUrl: event.image
  //       }));
  //       setLaunchedEvents(response3);
  //       const res = await fetchWithRefresh(`http://localhost:3000/api/current-user-details`,
  //         {
  //           method: "GET",
  //           credentials: "include",
  //         }
  //       );
  //       if (!res.ok) {
  //         const text = await res.text();
  //         console.error("Bad response from server:", res.status, text);
  //         throw new Error(`Server responded with ${res.status}`);
  //       }

  //       const response = await res.json();
  //       setUsername(response.user.username+response.user.role);
  //       setIsLoggedIn(true);
  //       if(response.user.role === 'usr') {
  //         const renamedEvents = response.user.events.map(event => ({
  //           eventId: event.event_id,
  //           eventName: event.name,
  //           venue: event.venue,
  //           dateTime: event.datetime,
  //           organizerName: event.organizer,
  //           description: event.description,
  //           cost: event.cost,
  //           contact1: event.contact1,
  //           contact2: event.contact2,
  //           organiserEmailId: event.email,
  //           eventLaunched: event.event_launched,
  //           eventCreator: event.organizer_username,
  //           imageUrl: event.image
  //         }));
  //       setEvents(renamedEvents);
  //       }
  //       else {
  //         const res1 = await fetch(`http://localhost:3000/api/events/org/${response.user.username}`,
  //           {
  //             method: "GET",
  //             credentials: "include",
  //           }
  //         );

  //         if (!res1.ok) {
  //         const text = await res1.text();
  //         console.error("Bad response from server:", res1.status, text);
  //         throw new Error(`Server responded with ${res1.status}`);
  //       }

  //         const response1 = await res1.json();
  //         setEvents(response1.map(event => ({
  //           eventId: event.event_id,
  //           eventName: event.name,
  //           venue: event.venue,
  //           dateTime: event.datetime,
  //           organizerName: event.organizer,
  //           description: event.description,
  //           cost: event.cost,
  //           contact1: event.contact1,
  //           contact2: event.contact2,
  //           organiserEmailId: event.email,
  //           eventLaunched: event.event_launched,
  //           eventCreator: event.organizer_username,
  //           imageUrl: event.image,
  //           maxParticipants: event.max_participants,
  //           ageLimit: event.age_limit
  //         })));
  //       }
  //     } catch (error) {
  //       console.log("Error loading the details about the user!", error);
  //     }
  //   }
  //   checkUser();
  // },[isLoggedIn]);

  // const setUserItems = () => { //TODO: instead of localStorage we have to store in database
  //   const userdetails = getUserItems();
  //   localStorage.setItem(username, JSON.stringify({...userdetails, userEvents: events}));
  // }
  
  // //const userDetails = getUserItems();
  // // useEffect(() => {
  // //   setEvents(Array.isArray(userDetails?.userEvents) ? userDetails.userEvents : []);
  // // // eslint-disable-next-line react-hooks/exhaustive-deps
  // // },[isLoggedIn]);

  // useEffect(() => {  //TODO: if we have to do any bigger work after adding a event, then may be this can cause problem, because it updates the localStorage after a render cycle
  //   setUserItems();
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // },[events]);

  // useEffect(() => {
  //   localStorage.setItem("launchedEvents",JSON.stringify(launchedEvents));
  // },[launchedEvents]);

  const createEvent = async (event) => {

    try {
      await fetch(`http://localhost:3000/api/host/${username.substring(0,username.length-3)}`,
    {
      method: "POST",
      headers: {
              "Content-Type": "application/json"
            },
      credentials: "include",
      body: JSON.stringify({
        event_id: event.eventId,
        name: event.eventName,
        venue: event.venue,
        datetime: event.dateTime,
        organizer: event.organiserName,
        contact1: event.contact1,
        contact2: event.contact2,
        email: event.organiserEmailId,
        description: event.description,
        cost: event.cost,
        organizer_username: event.eventCreator,
        image: event.imageUrl,
        age_limit: event.ageLimit,
        max_participants: event.maxLimit,
      })
    }
  )
  setEvents(prev => [...prev, event]);
    } catch (error) {
      console.log("something went wrong while creating an event", error);
    }
    // setEvents((prev) => (
    //   prev.push({eventId: dateNow, ...event})
    //shouldn't do state mutation
    // ));
  }

  const launchEvent = (event) => {
    setLaunchedEvents(prev => [...prev, event]);
  }

  const deleteEvent = async (deleteEventId) => {
    try {
      await fetch(`http://localhost:3000/api/events/delete/${deleteEventId}`,
        {
          method: 'DELETE',
          credentials: "include"
        }
      );
    setEvents(prevEvents => prevEvents.filter(event => event.eventId !== deleteEventId));
    setLaunchedEvents(prevlaunchedEvents => prevlaunchedEvents.filter(event => event.eventId !== deleteEventId));
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      throw new Error("something went wrong while deleting an event");
    }
  }

  const editEvent = async (event) => {

    await fetch(`http://localhost:3000/api/host/${username}/edit/${event.eventId}`,
        {
          method: 'PUT',
          headers: {
              "Content-Type": "application/json"
          },
          credentials: 'include',
          body: JSON.stringify({
            name: event.eventName,
            venue: event.venue,
            datetime: event.dateTime,
            organizer: event.organiserName,
            contact1: event.contact1,
            contact2: event.contact2,
            email: event.organiserEmailId,
            description: event.description,
            cost: event.cost,
            eventLaunched: event.eventLaunched
          })
        }
      );
    setEvents(prev => prev.map(prevEvent => prevEvent.eventId === event.eventId ? event : prevEvent));
  }

  const addEvent = async (event) => {
    try {
      await fetch(`http://localhost:3000/api/events/${event.eventId}/join/${username.substring(0,username.length-3)}`,
      {
        method: 'POST',
        headers: {
              "Content-Type": "application/json"
            },
        credentials: 'include',
        body: JSON.stringify({
          ticket_id: Date.now(),
          payment_time: Date.now(),
          cost: event.cost,
          toDisplay: true
        })
      }
    );
      setEvents((prevEvents) => [...prevEvents, event]);
    } catch (error) {
      console.log("something went wrong while making a user join an event.",error);
      throw new Error("something went wrong while making a user join an event.");
    }
  };

  const removeEvent = async (eventId) => {
    try {
      await fetch(`http://localhost:3000/api/tickets/disable/${eventId}`,
        {
          method: 'PUT',
          credentials: 'include'
        }
      );
    } catch (error) {
      console.log("error disabling a ticket", error);
      throw new Error("error disabling a ticket");
    }
    //setEvents((prevEvents) => prevEvents.map((event) => event.eventId === eventId));
  };

  const deleteTicket = () => {

  };

  const isEventFull = async (event) => {
    let currentParticipants;
    try {
      const resp = await fetch(`http://localhost:3000/api/events/${event.eventId}/participants`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );
      const response = await resp.json();
      currentParticipants = (response.participants).length;
    } catch (error) {
      console.log("unable to get the participants count", error);
      throw new Error("unable to get the participants count");
    }
    return currentParticipants >= event.maxLimit
  };

  // const updateParticipantCnt = (event, increment) => {
  //   // Update in events array
  //   setEvents(prevEvents => prevEvents.map(e => 
  //     e.eventId === event.eventId 
  //       ? { ...e, currentParticipants: (e.currentParticipants || 0) + increment, toDisplay: e.currentParticipants < e.maxLimit }
  //       : e
  //   ));
    
  //   // Update in launchedEvents array
  //   setLaunchedEvents(prevEvents => prevEvents.map(e => 
  //     e.eventId === event.eventId 
  //       ? { ...e, currentParticipants: (e.currentParticipants || 0) + increment, toDisplay: e.currentParticipants < e.maxLimit }
  //       : e
  //   ));
  // }

  return (
    <EventProvider value={{events, createEvent, launchEvent, setEvents, deleteEvent, editEvent, /*updateParticipantCnt,*/ isEventFull, setLaunchedEvents, launchedEvents}}>
      <UserProvider value={{username, isLoggedIn, setIsLoggedIn, setUsername, resetUserDetails,addEvent,removeEvent}}>
        <TicketProvider value={{deleteTicket}}>
          <BrowserRouter> {/*changed from createBrowserRouter to browser router because createbrowser router won't allow dynamic routes, which we want for different event pages*/}
          <Routes>
            <Route path='/' element={<Layout />}>
              <Route path='' element={
                <LoginChoice/>
              } />

              <Route path='org/login' element={
                  <div className="flex w-full min-h-screen bg-gray-900 justify-center items-center relative overflow-hidden">
                      {/* Background decorative elements */}
                      <div className="absolute top-10 left-10 w-32 h-32 bg-purple-600/10 rounded-full blur-xl"></div>
                      <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-xl"></div>
                      <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-indigo-600/5 rounded-full blur-lg"></div>

                      {/* Login Container */}
                      <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Event Management System</h1>
                        <p className="text-gray-300 text-center mb-6">Your complete solution for event planning, ticketing, and management. Sign in to get started.</p>
                        <div className="w-full">
                          <Login type="org" />
                        </div>
                      </div>
                  </div>
              }/>

              <Route path='usr/login' element={
                  <div className="flex w-full min-h-screen bg-gray-900 justify-center items-center relative overflow-hidden">
                      {/* Background decorative elements */}
                      <div className="absolute top-10 left-10 w-32 h-32 bg-purple-600/10 rounded-full blur-xl"></div>
                      <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-xl"></div>
                      <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-indigo-600/5 rounded-full blur-lg"></div>

                      {/* Login Container */}
                      <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                        <h1 className="text-2xl font-semibold text-white mb-4 text-center">Attending an Event?</h1>
                        <p className="text-gray-300 text-center mb-6">Log in to access your tickets, view upcoming events, and manage your profile.</p>
                        <div className="w-full">
                          <Login type="usr" />
                        </div>
                      </div>
                  </div>
              }/>

              <Route path='org/signup' element={
                <div className="flex flex-col md:flex-row w-full gap-8 p-6 bg-gray-900 min-h-[80vh] items-center justify-center relative overflow-hidden">
                  {/* Background decorative elements */}
                  <div className="absolute top-10 right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-xl"></div>
                  <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-xl"></div>
                  <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-indigo-600/5 rounded-full blur-lg"></div>
                  
                  {/* Content container */}
                  <div className="z-10 flex flex-col md:flex-row gap-8 w-full max-w-8xl items-center justify-center">
                    <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Create an Account</h1>
                      <p className="text-gray-300 text-center mb-6">Register as an event organizer to create and manage your own events.</p>
                      <div className="w-full">
                        <SignUp type="org" />
                      </div>
                    </div>
                  </div>
                </div>
              }/>


              <Route path='usr/signup' element={
                <div className="flex flex-col md:flex-row w-full gap-8 p-6 bg-gray-900 min-h-[80vh] items-center justify-center relative overflow-hidden">
                  {/* Background decorative elements */}
                  <div className="absolute top-10 right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-xl"></div>
                  <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-xl"></div>
                  <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-indigo-600/5 rounded-full blur-lg"></div>
                  
                  {/* Content container */}
                  <div className="z-10 flex flex-col md:flex-row gap-8 w-full max-w-8xl items-center justify-center">
                    <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                      <h2 className="text-2xl font-semibold text-white mb-4 text-center">Attendee Registration</h2>
                      <p className="text-gray-300 text-center mb-6">Sign up to discover events, purchase tickets, and join the community.</p>
                      <div className="w-full">
                        <SignUp type="usr" />
                      </div>
                    </div>
                  </div>
                </div>
              }/>
              <Route path='home' element={<Home eventsToRender={launchedEvents} />} />
              <Route path='myTickets' element={<MyTickets />} />
              <Route path='profile' element={<Profile />}/>
              <Route path="myevents" element={<MyEvents />} />
              <Route path="events/:creator/:eventId" element={<Event events1={launchedEvents}  events2={events}/>} />
              <Route path="events/:eventId/participants" element={<ParticipantList />} />
            </Route>
          <Route path='tickets/view/:ticketId' element={<MyTicketsView/>} />
          </Routes>
          </BrowserRouter>
        </TicketProvider>
      </UserProvider>
    </EventProvider>
  )
}

export default App