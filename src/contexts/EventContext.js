import {createContext, useContext} from 'react';

export const EventContext = createContext({
  events: [
    {
      eventId: 1,
      eventName: "event name",
      venue: "place",
      dateTime: "date and time",
      description: "anything about your event",
      organiserName: "name of the organiser",
      contact1: "1234567890",
      contact2: "1234567890",
      organiserEmailId: "email@gmail.com",
      imageUrl: "/defaultAvatar.webp",
      eventCreater: "event owner"
      //TODO: add the images here after starting backend
    }
  ],
  // eslint-disable-next-line no-unused-vars
  createEvent: (event) => {}
})

export const useEventContext = () => {
  return useContext(EventContext);
}

export const EventProvider = EventContext.Provider;