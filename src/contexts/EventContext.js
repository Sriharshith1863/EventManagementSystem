/* eslint-disable no-unused-vars */
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
      eventCreater: "event owner",
      eventLaunched: false,
      ageLimit: 0,
      maxLimit : 0,
      cost: 0
      //TODO: add the images here after starting backend
    }
  ],
  createEvent: (event) => {},
  launchEvent: (event) => {},
  setEvents: (event) => {},
  addEvent: (event) => {},
  deleteEvent: (eventId) => {},
  editEvent: (event) => {},
  launchedEvents: [],
  setLaunchedEvents: (event) => {},
  // updateParticipantCnt: (eventId, increment) => {},
  isEventFull: (event) => {}
})

export const useEventContext = () => {
  return useContext(EventContext);
}

export const EventProvider = EventContext.Provider;