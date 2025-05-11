import React, { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts';
import { useEventContext } from '../contexts';
import { fetchWithRefresh } from '../utils/fetchWithRefresh';
function Event({ events1, events2 }) {
  const { creator, eventId } = useParams();
  const { username, isLoggedIn, setUsername, setIsLoggedIn} = useUserContext();
  const [isUser , setIsUser ] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [dob, setDob] = useState(null);
  const { isEventFull, addEvent} = useEventContext();
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("text-red-500");
  const navigate = useNavigate();

  const displayMessage = (messageToDisplay, colorToDisplay, duration = 3000) => {
    setMessage(messageToDisplay);
    setColor(colorToDisplay);
    setTimeout(() => {
      setMessage("");
      setColor("");
    }, duration);
  }

  useEffect(() => {
      const checkUser = async () => {
        try {
          const res = await fetchWithRefresh(`http://localhost:3000/api/current-user-details`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const respo = await res.json();
          const response = respo.data;
          setUsername(response.user.username+response.user.role);
          setIsLoggedIn(true);
          setDob(response.user.dob);
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
          displayMessage("You can just see this page", "text-green-500");
        }
      }
      checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

  useEffect(() => {
    if (username.charAt(username.length - 1) === 'r') {
      setIsUser (true);
    }
    const joined = events2.some(element => element.eventId === Number(eventId));
    setIsJoined(joined);
    // const userdetails = JSON.parse(localStorage.getItem(`${username}`)) || [];
    // if (userdetails && userdetails.userEvents) {
    //   const joined = userdetails.userEvents.some(element => element.eventId === Number(eventId));
    //   setIsJoined(joined);
    //   // console.log(isJoined);
    // }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const handleJoinEvent = async () => {
    if (isLoggedIn && !isJoined) {
      // Get user details from localStorage

      //const userDetails = JSON.parse(localStorage.getItem(`${username}`)) || {};
      const userDOB = dob;
      if (!userDOB) {
        alert('Please update your date of birth in your profile before joining events.');
        return;
      }
      // Parse event date and user's DOB
      const eventDate = new Date(eventToRender.dateTime);
      const birthDate = new Date(userDOB);
      // Calculate age on event date
      let age = eventDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = eventDate.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && eventDate.getDate() < birthDate.getDate())) {
        age--;
      }
      // Check if user is under 18
      if (age < event.ageLimit) {
        alert(`Sorry, you must be at least ${event.ageLimit} years old to join this event.`);
        return;
      }

      // const eventToJoin = {
      //   eventId: event.eventId,
      //   eventName: event.eventName,
      // };

      // console.log(event.eventId);
      // console.log("currentParticipants:", event.currentParticipants, typeof event.currentParticipants);
      // console.log("maxLimit:", event.maxLimit, typeof event.maxLimit);

      if(isEventFull(eventToRender)){
        displayMessage("Sorry , this event is Full", "text-red-500");
        return;
      }

      addEvent(eventToRender);
      displayMessage("You have joined the event!", "text-green-500", 5000);
      //alert('You have joined the event!');
      setIsJoined(true);

      
      // const alltickets = await fetch(`http://localhost:3000/api/allTickets`,
      //   {
      //     method: "GET",
      //     credentials: "include"
      //   }
      // );
      // const allTickets = await alltickets.json() || [];
      // //const allTickets = JSON.parse(localStorage.getItem('tickets')) || [];
      // const newTicket = {
      //     ticket_id: Date.now(),
      //     ticketcnt: 1,
      //     event_id: eventToRender.eventId,
      //     username: username,
      //     Payment_time: new Date().toLocaleDateString(),
      //     cost: eventToRender.ticketCost
      //     // eventId: 1,
      //     // eventName: "event name",
      //     // venue: "place",
      //     // dateTime: "date and time",
      //     // description: "anything about your event",
      //     // organiserName: "name of the organiser",
      //     // contact1: "1234567890",
      //     // contact2: "1234567890",
      //     // organiserEmailId: "email@gmail.com",
      //     // imageUrl: "/defaultAvatar.webp",
      //     // eventCreater: "event owner",
      //   }
      // allTickets.push(newTicket);
      try {
        await fetch(`http://localhost:3000/api/events/${eventId}/join/${username.substring(0,username.length-3)}`,
        {
          method: 'POST',
          headers: {
              "Content-Type": "application/json"
            },
          credentials: "include",
          body: JSON.stringify({
            ticket_id: Date.now(),
            ticketcnt: 1,
            event_id: eventToRender.eventId,
            username: username,
            Payment_time: new Date().toLocaleDateString(),
            cost: eventToRender.cost,
            toDisplay: true
          })
        }
      );
        //localStorage.setItem('tickets', JSON.stringify(allTickets));
        // const increment = 1;
        // updateParticipantCnt(eventToRender,increment);
        // Update local storage
        // const userdetails = JSON.parse(localStorage.getItem(`${username}`)) || { userEvents: [] };
        // userdetails.userEvents.push(eventToJoin);
        // localStorage.setItem(`${username}`, JSON.stringify(userdetails));
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        displayMessage("something went wrong while storing a ticket.", "text-red-500", 2000);
      }
    } else {
      displayMessage("You are already joined or not Logged in.", "text-red-500", 5000);
    }
  };

  let eventToRender = events1.find(event =>
    event.eventId === Number(eventId) && event.eventCreater === creator
  );

  if (!eventToRender) {
    eventToRender = events2.find(event =>
      event.eventId === Number(eventId) && event.eventCreater === creator
    );
  }
  if (!eventToRender) return <div>event not found</div>;

  
  const event = eventToRender || {
    eventName: "Event Name",
    description: "No description available",
    venue: "Not specified",
    dateTime: "Not specified",
    organiserName: "Not specified",
    contact1: "Not specified",
    contact2: "Not specified",
    organiserEmailId: "Not specified",
    imageUrl: "/defaultAvatar.webp",
    eventCreater: "Not specified",
    eventLaunched: false,
  };
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {message && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg ${color === "text-green-500" ? "bg-green-900/70" : "bg-red-900/70"}`}>
          <p className={`font-medium ${color}`}>{message}</p>
        </div>
      )}
      <div className="w-full px-4 py-8">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left side - Event information */}
          <div className="w-full lg:w-3/5 pr-0 lg:pr-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-indigo-400 mb-4 break-words">{event.eventName}</h1>
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-8">
                <p className="text-gray-300 text-lg mb-6 leading-relaxed break-words whitespace-normal">{event.description}</p>
                <div className="space-y-6 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-medium text-white">Venue</h2>
                      <p className="text-gray-300 text-lg break-words">{event.venue}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-medium text-white">Date and Time</h2>
                      <p className="text-gray-300 text-lg break-words">{event.dateTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <h2 className="text-2xl font-semibold text-indigo-300 mb-6">Organiser Details</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-white">Organiser</h3>
                    <p className="text-gray-300 text-lg break-words">{event.organiserName}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-white">Primary Contact</h3>
                    <p className="text-gray-300 text-lg break-words">{event.contact1}</p>
                  </div>
                </div>
                <div>
                  {!isUser && isJoined && (<div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-medium text-white"> Number of Paricipants</h3>
                      <p className="text-gray-300 text-lg break-words">{event.currentParticipants}</p>
                    </div>
                  </div>)}
                </div>
                {event.contact2 && event.contact2 !== "Not specified" && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-medium text-white">Secondary Contact</h3>
                      <p className="text-gray-300 text-lg break-words">{event.contact2}</p>
                    </div>
                  </div>
                )}
                {event.organiserEmailId && event.organiserEmailId !== "Not specified" && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-medium text-white">Email</h3>
                      <p className="text-gray-300 text-lg break-words">{event.organiserEmailId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Right side - Event image */}
          <div className="w-full lg:w-2/5 mt-8 lg:mt-0">
            <div className="sticky top-8">
              <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 h-full">
                <img 
                  src={event.imageUrl} 
                  alt={event.eventName}
                  className="w-full h-auto object-cover rounded-lg"
                />
                {isUser  && !isJoined  && (
                  <button
                    className='bg-blue-600 hover:bg-blue-800 cursor-pointer px-3 py-2 w-full mt-3 rounded-lg'
                    onClick={handleJoinEvent}>Join Event</button>
                )}
                {isUser  && isJoined  && (
                  <button
                    className='bg-blue-600 cursor-not-allowed hover:bg-blue-800 px-3 py-2 w-full mt-3 rounded-lg'
                    disabled
                  >Joined</button>
                )}
                {
                  !isUser && isLoggedIn && (
                    <button
                    className='bg-blue-600 hover:bg-blue-800 cursor-pointer px-3 py-2 w-full mt-3 rounded-lg'
                    onClick={() => navigate(`/events/${eventId}/participants`)}>
                        Participant's list
                    </button>
                  )
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Event;