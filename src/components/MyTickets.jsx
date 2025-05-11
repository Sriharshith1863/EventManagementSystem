import React, { useEffect, useState } from 'react';
import { useUserContext } from '../contexts';
import { useNavigate } from 'react-router-dom';
import { fetchWithRefresh } from '../utils/fetchWithRefresh';
function MyTickets() {
  const { isLoggedIn, username, removeEvent, setUsername, setIsLoggedIn } = useUserContext();
  const navigate = useNavigate();
  const [userEvents, setUserEvents] = useState([]);
  //const userDetails = JSON.parse(localStorage.getItem(`${username}`)) || {};
  //const allTickets = JSON.parse(localStorage.getItem('tickets')) || [];
  //const tickets = allTickets.filter(ticket => ticket.username === username);
  
  useEffect(() => {
    const checkUser = async () => {
          try {
            const res = await fetchWithRefresh(`http://localhost:3000/api/current-user-details`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            const response = await res.json();
            setUsername(response.user.username+response.user.role);
            setIsLoggedIn(true);


            const resp = await fetch(`http://localhost:3000/api/tickets/${response.user.username}`,
              {
                method: 'GET',
                credentials: 'include'
              }
            );
            const respo = await resp.json();
            const response1 = respo.map(ticket => ({
              ticketId: ticket.ticket_id,
              eventId: ticket.event_id,
              username: ticket.username,
              paymentTime: ticket.payment_time,
              cost: ticket.cost,
              toDisplay: ticket.to_display
            }));
            const filteredEvents = (response1 || []).filter(ticket => ticket.toDisplay === true);
            setUserEvents(filteredEvents || []);
          } catch (error) {
            console.log("error fetching refresh and access tokens",error);
            navigate('/');
          }
        }
        checkUser();
    // if (!isLoggedIn) {
    //   navigate('/');
    // } else {
    //   const filteredEvents = (userDetails.userEvents || []).filter(event => event.toDisplay === true);
    //   setUserEvents(filteredEvents || []);
    // }
    // eslint-disable-next-line
  }, [isLoggedIn, username]);

  // const handleDeleteEvent = (eventId) => {
  //   // removeEvent(eventId);
  //   // setUserEvents(prevEvents => prevEvents.filter(event => event.eventId !== eventId));
    
  // };

  const handleDeleteEvent = (eventId) => {
    // Update the toDisplay property for the specific event
    setUserEvents(prevEvents => prevEvents.map(event => 
      event.eventId === eventId 
        ? { ...event, toDisplay: false }
        : event
    ));
    removeEvent(eventId);
    // Save back to localStorage
    // localStorage.setItem(username, JSON.stringify({
    //   ...userDetails,
    //   userEvents: updatedEvents
    // }));
    // Update the state to remove the event from view
    //setUserEvents(prevEvents => prevEvents.filter(event => event.eventId !== eventId));
  };

  const handleViewEvent = (eventId) => {
    const ticket = userEvents.find(ticket => ticket.eventId === eventId && ticket.toDisplay === true);
    if (ticket) {
      navigate(`/tickets/view/${ticket.ticketId}`); // Use ticketId for navigation
    }
  };

  return (
    <>
      <div className="bg-gray-800 p-4">MyTickets</div>
      <div className="bg-gray-800 p-4">
        <h1 className="text-2xl font-bold text-white mb-4">My Tickets</h1>
        {userEvents.length === 0 ? (
          <p className="text-gray-300">No tickets found.</p>
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
