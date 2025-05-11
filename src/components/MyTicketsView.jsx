import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserContext } from '../contexts';
import { fetchWithRefresh } from '../utils/fetchWithRefresh';
function MyTicketsView() {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const { username, setUsername, setIsLoggedIn } = useUserContext();
    const ticketRef = useRef();
    const [eventToRender, setEventToRender] = useState([]);
    //const allTickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const [ticket, setTicket] = useState({});
    const fetchTickets = async () => {
        try {
            const resp = await fetch(`http://localhost:3000/api/tickets/${username.substring(0,username.length-3)}`,
        {
            method: 'GET',
            credentials: 'include'
        }
        );
        const response = await resp.json();
        const allTickets = response.map(ticket => ({
            ticketId: ticket.ticket_id,
            eventId: ticket.event_id,
            username: ticket.username,
            paymentTime: ticket.payment_time,
            cost: ticket.cost,
            toDisplay: ticket.to_display
        }));
        setTicket(allTickets.filter(tickets => tickets.ticketId === ticketId));
        const renamedEvents = response.user.events.map(event => ({
            eventId: event.event_id,
            eventName: event.name,
            venue: event.venue,
            dateTime: event.datetime,
            organizer: event.organizerName,
            description: event.description,
            cost: event.cost,
            contact1: event.contact1,
            contact2: event.contact2,
            organiserEmailId: event.email,
            eventLaunched: event.eventLaunched,
          }));
        setEventToRender(renamedEvents.filter(event => event.eventId === ticket.eventId));
        } catch (error) {
            console.log("something went wrong while fetching tickets from DB.", error);
            throw new Error("something went wrong while fetching tickets from DB.");
        }
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
            const response = await res.json();
            setUsername(response.user.username+response.user.role);
            setIsLoggedIn(true);
            fetchTickets();
          } catch (error) {
            navigate('/home');
            console.log("something went wrong while checking and fetching access and refresh tokens", error);
            throw new Error("something went wrong while checking and fetching access and refresh tokens")
          }
        }
        checkUser();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      },[]);

    // useEffect(() => {

    // }, [isLoggedIn, navigate]);

    const handleDownload=() => {
        window.print();
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4 flex items-center justify-center">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-red-400 mb-4">Ticket Not Found</h1>
                    <button
                        onClick={() => navigate('/myTickets')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                        Back to My Tickets
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-indigo-400">Event Ticket</h1>
                    <button
                        onClick={() => navigate('/myTickets')}
                        className="px-4 py-2 cursor-pointer bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Back to Tickets</span>
                    </button>
                </div>

                <div
                    ref={ticketRef}
                    className="bg-gray-800 rounded-lg border border-gray-700 p-6 shadow-lg"
                    style={{
                        width: '100%',
                        boxSizing: 'border-box',
                    }}
                >
                    <h2 className="text-2xl font-semibold text-white mb-6 text-center break-words">{ticket.eventName}</h2>

                    <div className="space-y-4">
                        {[
                            ['Ticket ID', ticket.ticketId],
                            ['Event ID', ticket.eventId],
                            ['Event Name', eventToRender.eventName],
                            ['Purchase Date', ticket.PaymentTime],
                            ['Venue', eventToRender.venue],
                            ['Date & Time', eventToRender.dateTime],
                            ['Contact 1', eventToRender.contact1],
                            ['Contact 2', eventToRender.contact2],
                            ['Organizer Email', eventToRender.organiserEmailId],
                            ['Event Creator', eventToRender.organiserName]
                        ].map(([label, value], idx) => (
                            <div
                                key={idx}
                                className="flex justify-between items-center p-3 bg-gray-700/70 rounded-lg break-words"
                                style={{ wordBreak: 'break-word' }}
                            >
                                <span className="text-gray-400">{label}</span>
                                <span className="text-white font-medium">{value || '-'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleDownload}
                        className="px-6 py-3 bg-indigo-600 cursor-pointer text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
                        aria-label="Download Ticket"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Download Ticket</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MyTicketsView;
