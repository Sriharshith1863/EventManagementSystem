import { createContext, useContext } from "react";

export const TicketContext = createContext({
    ticket : [
        {
            ticketId: 1,
            ticketcnt: 1,
            eventId: 1,
            eventName: "eventname",
            username: "name",
            PurchaseDate: "date",
            venue: "venue",
            dateTime: "datetime",
            contact1: "123456789",
            contact2: "123456789",
            organiserEmailId: "hi@gmail.com",
            eventCreater: "organiser"
        }
    ],
    deleteTicket : () => {},
    addTicket : () => {}
})

export const useTicketContext = () => {
    return useContext(TicketContext);
}

export const TicketProvider = TicketContext.Provider;