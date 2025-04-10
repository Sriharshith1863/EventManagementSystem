// import React, {useEffect, useState, useMemo} from 'react'
// import { useEventContext, useUserContext } from '../contexts'
// import { useNavigate } from 'react-router-dom';
// import Event from './Event';
// function MyEvents() {
//   const {isLoggedIn, username} = useUserContext();
//   const {events, createEvent} = useEventContext();
//   const initialFormData = {
//     eventName: "",
//     venue: "",
//     dateTime: "",
//     description: "",
//     organiserName: "",
//     contact1: "",
//     contact2: "",
//     organiserEmailId: "",
//     imageUrl: "/defaultAvatar.webp",
//     eventCreater: `${username}`
//   };
  
//   const [formData, setFormData] = useState(initialFormData);

//     const navigate = useNavigate();
//     const [activateForm, setActiveForm] = useState(false);
//     useEffect(() => {
//       if (!isLoggedIn) {
//         navigate('/');
//       }
//       if(username.substring(username.length-3) !== 'org') {
//         navigate('/home');
//       }
//       // eslint-disable-next-line
//     }, []);

//     const submitForm = (e) => {
//       e.preventDefault();
//       createEvent(formData);
//       setActiveForm(false);
//       setFormData(initialFormData);
//     }

//     const handleChange = (e) => {
//       const { name, value } = e.target;
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     };

//     const renderedEvents = useMemo(() => {
      
//       return (
//         <ul>
//           {
//             events.map((event, index) => (
//               <li key={index} onClick={() => navigate(`/events/${username}/${event.eventId}`)} className="border-violet-600">
//                 {
//                   event.eventName
//                 }
//               </li>
//             ))
//           }
//         </ul>
//       );
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [events]);
//   return (
//     <div className="bg-gray-800 p-4">
//       <div>
//         <button onClick={() => {setActiveForm(true)}} className={`bg-indigo-600 hover:bg-indigo-700 ${activateForm? "hidden" : ""}`}>Create Event</button>
//         <form id="eventCreateForm" className={`${activateForm? "z-10" : "hidden"} flex flex-col`} onSubmit={submitForm}>
//           <label htmlFor='eventName'>Event Name: </label>
//           <input type="text" id="eventName" name="eventName" onChange={handleChange} value={formData.eventName} required={true}/>
//           <label htmlFor='venue'>Venue: </label>
//           <input type="text" id="venue" name="venue" onChange={handleChange} value={formData.venue} required={true}/>
//           <label htmlFor='dateTime'>Date and Time:</label>
//           <input type="datetime" id="dateTime" name="dateTime" onChange={handleChange} value={formData.dateTime} required={true}/>
//           <label htmlFor='description'>Description: </label>
//           <input type="text" id="description" name="description" onChange={handleChange} value={formData.description}/>
//           <label htmlFor='organiserName'>Organiser: </label>
//           <input type="text" id="organiserName" name="organiserName" onChange={handleChange} value={formData.organiserName} required={true}/>
//           <label htmlFor='contact1'>Contact1: </label>
//           <input type="tel" id="contact1" name="contact1" onChange={handleChange} value={formData.contact1} required={true}/>
//           <label htmlFor='contact2'>Contact2: </label>
//           <input type="tel" id="contact2" name="contact2" onChange={handleChange} value={formData.contact2}/>
//           <label htmlFor='contactEmail'>Email: </label>
//           <input type="email" id="organiserEmailId" name="organiserEmailId" onChange={handleChange} value={formData.organiserEmailId}/>
//           <button type="submit">Create</button>
//         </form>
//       </div>
//       <div>
//         {renderedEvents}
//       </div>
//     </div>
//   )
// }

// export default MyEvents


import React, {useEffect, useState, useMemo} from 'react'
import { useEventContext, useUserContext } from '../contexts'
import { useNavigate } from 'react-router-dom';
import Event from './Event';

function MyEvents() {
  const {isLoggedIn, username} = useUserContext();
  const {events, createEvent} = useEventContext();
  const initialFormData = {
    eventName: "",
    venue: "",
    dateTime: "",
    description: "",
    organiserName: "",
    contact1: "",
    contact2: "",
    organiserEmailId: "",
    imageUrl: "/defaultAvatar.webp",
    eventCreater: `${username}`
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const navigate = useNavigate();
  const [activateForm, setActiveForm] = useState(false);
  
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
    if(username.substring(username.length-3) !== 'org') {
      navigate('/home');
    }
    // eslint-disable-next-line
  }, []);

  const submitForm = (e) => {
    console.log("called");
    e.preventDefault();
    createEvent(formData);
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
              onClick={() => navigate(`/events/${username}/${event.eventId}`)} 
              className="bg-gray-800 rounded-lg border border-gray-700 hover:border-indigo-500 p-4 shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-indigo-900/20 w-full"
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
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{event.eventName}</h3>
                    <p className="text-gray-400 text-lg">{event.venue} • {event.dateTime}</p>
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
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-colors duration-200 ${activateForm ? "hidden" : ""}`}
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
                <h2 className="text-xl font-semibold text-indigo-300">Create New Event</h2>
                <button 
                  onClick={() => setActiveForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

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
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg mr-4 hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Create Event
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