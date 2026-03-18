import Event from "../models/Event.js";

export const createEvent = async (data) => {
  return Event.create(data);
};