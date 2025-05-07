import React from 'react';
import { useParams } from 'react-router-dom';

function ParticipantList() {
    const { eventId } = useParams();
    const allTickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const eventTickets = allTickets.filter(ticket => ticket.eventId === Number(eventId));

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Event Participants</h1>
                
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ticket ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Purchase Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {eventTickets.map((ticket) => (
                                    <tr key={ticket.ticketId} className="hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{ticket.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{ticket.contact1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{ticket.ticketId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{ticket.PurchaseDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ParticipantList;