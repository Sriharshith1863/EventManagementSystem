import React, { useEffect, useState } from 'react';
import { useEventContext, useUserContext } from '../contexts';
import { useNavigate } from 'react-router-dom';

function MyTickets() {
  const { isLoggedIn, username, removeEvent } = useUserContext();
  const navigate = useNavigate();
  const [userEvents, setUserEvents] = useState([]);
  const {updateParticipantCnt} = useEventContext();
  const userDetails = JSON.parse(localStorage.getItem(`${username}`)) || {};
  const allTickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const tickets = allTickets.filter(ticket => ticket.username === username);
  
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    } else {
      const filteredEvents = (userDetails.userEvents || []).filter(event => event.toDisplay === true);
      setUserEvents(filteredEvents || []);
    }
    // eslint-disable-next-line
  }, [isLoggedIn, username]);

  // const handleDeleteEvent = (eventId) => {
  //   // removeEvent(eventId);
  //   // setUserEvents(prevEvents => prevEvents.filter(event => event.eventId !== eventId));
    
  // };

  const handleDeleteEvent = (eventId) => {
    // Update the toDisplay property for the specific event
    const updatedEvents = userDetails.userEvents.map(event => 
      event.eventId === eventId 
        ? { ...event, toDisplay: false }
        : event
    );
    // Save back to localStorage
    localStorage.setItem(username, JSON.stringify({
      ...userDetails,
      userEvents: updatedEvents
    }));
    // Update the state to remove the event from view
    setUserEvents(prevEvents => prevEvents.filter(event => event.eventId !== eventId));
  };

  const handleViewEvent = (eventId) => {
    const ticket = tickets.find(ticket => ticket.eventId === eventId);
    if (ticket) {
      navigate(`/tickets/view/${ticket.ticketId}`); // Use ticketId for navigation
    }
  };

  const handleCancelTicket = (eventId) => {
    const to_be_removed = tickets.find(ticket  => ticket.eventId === eventId);
    updateParticipantCnt(eventId,-1);
    removeEvent(eventId);
    const after_removed = allTickets.filter(ticket => ticket.ticketId !== to_be_removed.ticketId);
    localStorage.setItem('tickets',JSON.stringify(after_removed));
    setUserEvents(prevEvents => prevEvents.filter(event => event.eventId !== eventId));
  };

  return (
    <>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 shadow-md">
          <h1 className="text-3xl font-extrabold text-white tracking-wide">🎟 MyTickets</h1>
        </div>
      <div className="bg-gray-900 p-8 min-h-screen">
        <h1 className="text-3xl font-bold text-white mb-6 text-center drop-shadow-md">My Tickets</h1>
        {userEvents.length === 0 ? (
          <div className='bg-gray-900 rounded-lg p-4 h-96 flex flex-col justify-center items-center'>
            <p className="text-gray-300 text-center">No tickets found.</p>
            <div className="flex justify-center mt-4">
              <button 
                className='bg-blue-600 hover:bg-blue-800 transition-colors cursor-pointer px-3 py-2 rounded-lg'
                onClick={() => navigate('/Home')}
              >
                Browse Events
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {userEvents.map((event) => (
              <div key={event.eventId} className="bg-gray-700 rounded-lg p-4 shadow-lg">
                <h2 className="text-xl font-medium text-white">{event.eventName}</h2>
                <p className="text-gray-300 text-lg">{event.description}</p>
                <div className="flex justify-end mt-4">
                  <button
                    className="bg-blue-600 hover:bg-blue-800 cursor-pointer px-3 py-2 rounded-lg mr-2"
                    onClick={() => handleViewEvent(event.eventId)}
                  >
                    View
                  </button>
                  <button
                    className="bg-green-600 hover:bg-green-800 cursor-pointer px-3 py-2 rounded-lg mr-2"
                    onClick={() => handleCancelTicket(event.eventId)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-800 cursor-pointer px-3 py-2 rounded-lg"
                    onClick={() => handleDeleteEvent(event.eventId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default MyTickets;
