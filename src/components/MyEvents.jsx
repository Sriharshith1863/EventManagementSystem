import React, {useEffect, useState, useMemo} from 'react'
import { useEventContext, useUserContext } from '../contexts'
import { useNavigate } from 'react-router-dom';
import { fetchWithRefresh } from '../utils/fetchWithRefresh';
// import { useTicketContext } from '../contexts/TicketContext';
import Event from './Event';

function MyEvents() {
  const {username, setUsername, setIsLoggedIn} = useUserContext();
  const {events, createEvent, launchEvent, setEvents, deleteEvent, editEvent, setLaunchedEvents} = useEventContext();
  // const {tickets, removeTicket}=useTicketContext();
  const initialFormData = {
    eventId: 0,
    eventName: "",
    venue: "",
    dateTime: "",
    description: "",
    organiserName: "",
    contact1: "",
    contact2: "",
    organiserEmailId: "",
    imageUrl: "/defaultAvatar.webp",
    eventCreater: `${username.substring(0, username.length-3)}`,
    eventLaunched: false,
    ageLimit: 0,
    maxLimit: 0,
    cost: 0,
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const navigate = useNavigate();
  const [activateForm, setActiveForm] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  useEffect(() => {
        console.log("able to get to this page");
        const checkUser = async () => {
          try {
            console.log(1);
            const res = await fetch(`http://localhost:3000/api/current-user-details`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            console.log(2);
            if(!res.ok) {
              console.log("error fetching user details....");
              throw new Error("error fetching user details...");
            }
            console.log(3);
            const response = await res.json();
            setUsername(response.user.username+response.user.role);
            setIsLoggedIn(true);
            setEvents(response.user.events.map(event => ({
            eventId: event.event_id,
            eventName: event.name,
            venue: event.venue,
            dateTime: event.datetime,
            organizerName: event.organizer,
            description: event.description,
            cost: event.cost,
            contact1: event.contact1,
            contact2: event.contact2,
            organiserEmailId: event.email,
            eventLaunched: event.event_launched,
            eventCreator: event.organizer_username,
            imageUrl: event.image
        })));
            const resp1 = await fetch(`http://localhost:3000/api/home`,
          {
            method: 'GET',
          }
        );
        const resp3 = await resp1.json();
        const response3 = resp3.map(event => ({
            eventId: event.event_id,
            eventName: event.name,
            venue: event.venue,
            dateTime: event.datetime,
            organizerName: event.organizer,
            description: event.description,
            cost: event.cost,
            contact1: event.contact1,
            contact2: event.contact2,
            organiserEmailId: event.email,
            eventLaunched: event.event_launched,
            eventCreator: event.organizer_username,
            imageUrl: event.image
        }));
        setLaunchedEvents(response3.filter(event => event.eventLaunched === true));
            console.log(response.user.role);
            if(response.user.role !== "org") {
              navigate("/home");
            }
          // eslint-disable-next-line no-unused-vars
          } catch (error) {
            navigate("/");
          }
        }
        checkUser();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      },[]);
  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     navigate('/');
  //   }
  //   if(username.substring(username.length-3) !== 'org') {
  //     navigate('/home');
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isLoggedIn, username]);
  const submitForm = (e) => {
    e.preventDefault();
    if(!isEditable) {
    createEvent({...formData, eventId: Date.now()});
    }
    else {
      setIsEditable(false);
      editEvent(formData);
    }
    setActiveForm(false);
    setFormData(initialFormData);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLaunch = async (launchEventId, event) => {
    try {
      await fetch(`http://localhost:3000/api/host/${username.substring(0,username.length-3)}/edit/${launchEventId}`,
        {
          method: 'PUT',
          headers: {
              "Content-Type": "application/json"
            },
          credentials: 'include',
          body: {
            name: event.eventName,
            venue: event.venue,
            datetime: event.dateTime,
            organizer: event.organiserName,
            contact1: event.contact1,
            contact2: event.contact2,
            email: event.organiserEmailId,
            description: event.description,
            cost: event.cost,
            eventLaunched: true
          }
        }
      );
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.eventId === launchEventId
            ? { ...event, eventLaunched: true, /*toDisplay: true*/ }
            : event
        )
      );
      launchEvent({...event, eventLaunched: true, /*toDisplay: true*/});
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      throw new Error("something went wrong while uploading the event");
    }
  }

  const handleEdit = (event) => {
    setIsEditable(true);
    setActiveForm(true);
    setFormData(event);
  }

  const handledelete= (eventID) => {
    // const userTickets = tickets.filter(ticket => ticket.username === username);
    // const ticket=userTickets.filter(ticket=>ticket.eventId===eventID);
    deleteEvent(eventID);
    // removeTicket(ticket.ticketId);
  }

  const renderedEvents = useMemo(() => {
    console.log(events);
    return (
      <div className="space-y-4 mt-8 w-full">
        {events.length === 0 ? (
          <div className="text-center py-10 bg-gray-800 rounded-xl border border-gray-700 w-full">
            <p className="text-gray-400 text-lg">No events created yet</p>
            <p className="text-gray-500 mt-2">Create your first event to see it here</p>
          </div>
        ) : (
          events.map((event, index) => (
            <div 
              key={index} 
               
              className="bg-gray-800 rounded-lg border border-gray-700 hover:border-indigo-500 p-4 shadow-md transition-all duration-200 hover:shadow-lg hover:shadow-indigo-900/20 w-full"
            >
              <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img 
                    src={event.imageUrl || "/defaultAvatar.webp"} 
                    alt={event.eventName} 
                    className="h-16 w-16 rounded-full object-cover border-2 border-gray-700"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-semibold text-white">{event.eventName}</h3>
                  <p className="text-gray-400 text-lg">{event.venue} • {event.dateTime}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => navigate(`/events/${username}/${event.eventId}`)} 
                    className="bg-indigo-600 cursor-pointer hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                  
                  {//TODO: we should impose this condition using values fetched from backend!!
                    !event.eventLaunched && (
                      <button 
                        onClick={() => handleLaunch(event.eventId, event)} 
                        className="bg-green-500 cursor-pointer hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                        </svg>
                        Launch
                      </button>
                    )
                  }
                  
                  {
                    !event.eventLaunched && (
                      <button 
                        onClick={() => handleEdit(event)}
                        className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    )
                  }
                  {/*TODO: if it can be try to add a confirm delete form, "Do you really want to delete?"*/}
                  <button 
                    onClick={() => handledelete(event.eventId)}
                    className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
                <div className="hidden md:block text-gray-500 hover:text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-400">My Events</h1>
          <button 
            onClick={() => {setActiveForm(true)}} 
            className={`bg-indigo-600 cursor-pointer hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-colors duration-200 ${activateForm ? "hidden" : ""}`}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Event
            </div>
          </button>
        </div>

        {/* Create Event Form */}
        {activateForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gray-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-indigo-300">{isEditable? "Edit Event" : "Create New Event"}</h2>
                <button 
                  onClick={() => setActiveForm(false)}
                  className="text-gray-400 cursor-pointer hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/*TODO: we have to add the input field for ticket somehow*/}
              <form id="eventCreateForm" className="p-6" onSubmit={submitForm}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="eventName" className="block text-sm font-medium text-gray-400">Event Name</label>
                    <input 
                      type="text" 
                      id="eventName" 
                      name="eventName" 
                      onChange={handleChange} 
                      value={formData.eventName} 
                      required={true}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="venue" className="block text-sm font-medium text-gray-400">Venue</label>
                    <input 
                      type="text" 
                      id="venue" 
                      name="venue" 
                      onChange={handleChange} 
                      value={formData.venue} 
                      required={true}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="dateTime" className="block text-sm font-medium text-gray-400">Date and Time</label>
                    <input 
                      type="datetime-local" 
                      id="dateTime" 
                      name="dateTime" 
                      onChange={handleChange} 
                      value={formData.dateTime} 
                      required={true}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="organiserName" className="block text-sm font-medium text-gray-400">Organiser</label>
                    <input 
                      type="text" 
                      id="organiserName" 
                      name="organiserName" 
                      onChange={handleChange} 
                      value={formData.organiserName} 
                      required={true}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="contact1" className="block text-sm font-medium text-gray-400">Contact #1</label>
                    <input 
                      type="tel" 
                      id="contact1" 
                      name="contact1" 
                      onChange={handleChange} 
                      value={formData.contact1} 
                      required={true}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="contact2" className="block text-sm font-medium text-gray-400">Contact #2 (Optional)</label>
                    <input 
                      type="tel" 
                      id="contact2" 
                      name="contact2" 
                      onChange={handleChange} 
                      value={formData.contact2}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="organiserEmailId" className="block text-sm font-medium text-gray-400">Email (Optional)</label>
                    <input 
                      type="email" 
                      id="organiserEmailId" 
                      name="organiserEmailId" 
                      onChange={handleChange} 
                      value={formData.organiserEmailId}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="venue" className="block text-sm font-medium text-gray-400">Maximum Participants</label>
                    <input 
                      type="text" 
                      id="maxLimit" 
                      name="maxLimit" 
                      onChange={handleChange} 
                      value={formData.maxLimit} 
                      required={true}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="venue" className="block text-sm font-medium text-gray-400">Age Limit(Participants under this age are not allowed)</label>
                    <input 
                      type="text" 
                      id="ageLimit" 
                      name="ageLimit" 
                      onChange={handleChange} 
                      value={formData.ageLimit} 
                      required={true}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>                  
                    <div className="space-y-2">
                    <label htmlFor="cost" className="block text-sm font-medium text-gray-400">Ticket Cost (₹)</label>
                    <input 
                      type="number" 
                      id="cost" 
                      name="cost" 
                      onChange={handleChange} 
                      value={formData.cost} 
                      required={true}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-400">Description</label>
                    <textarea 
                      id="description" 
                      name="description" 
                      onChange={handleChange} 
                      value={formData.description}
                      rows="4"
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    ></textarea>
                  </div>

                </div>
                
                <div className="mt-8 flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => setActiveForm(false)} 
                    className="px-4 py-2 bg-gray-700 cursor-pointer text-gray-300 rounded-lg mr-4 hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 cursor-pointer bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
                  >
                    {isEditable? "Edit Event" : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Event List */}
        <div className="w-full">
          {renderedEvents}
        </div>
      </div>
    </div>
  )
}

export default MyEvents