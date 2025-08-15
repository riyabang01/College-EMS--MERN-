const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Event = require('../models/eventModel');

// ✅ Get Upcoming Events
const getUpcomingEvents = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  // ✅ Upcoming events ko find karo aur `registeredUsers` ko populate karo
  const events = await Event.find({ date: { $gte: new Date() } })
    .populate('registeredUsers', 'name email'); // ✅ Sirf `name` aur `email` ko fetch karo

  if (!events.length) {
    return res.status(404).json({ message: 'No upcoming events found' });
  }

  const updatedEvents = events.map((event) => {
    const eventData = event.toObject();
    return {
      ...eventData,
      isRegistered: event.registeredUsers.some(
        (user) => user.toString() === req.user._id.toString()
      ),
    };
  });

  res.status(200).json(updatedEvents);
});

// ✅ Register for Event
const registerEvent = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { id } = req.params;

  // ✅ Check for valid ObjectId
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  const event = await Event.findById(id);

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  if (event.date < new Date()) {
    return res.status(400).json({ message: 'Cannot register for past events' });
  }

  if (event.registeredUsers.some((user) => user.toString() === req.user._id.toString())) {
    return res.status(400).json({ message: 'You have already registered for this event' });
  }

  event.registeredUsers.push(req.user._id);
  await event.save();

  res.status(200).json({ message: 'Registered successfully' });
});

// ✅ Unregister from Event
const unregisterEvent = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { id } = req.params;

  // ✅ Check for valid ObjectId
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  const event = await Event.findById(id);

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  if (!event.registeredUsers.some((user) => user.toString() === req.user._id.toString())) {
    return res.status(400).json({ message: 'You are not registered for this event' });
  }

  event.registeredUsers = event.registeredUsers.filter(
    (user) => user.toString() !== req.user._id.toString()
  );

  await event.save();

  res.status(200).json({ message: 'Unregistered successfully' });
});

module.exports = {
  getUpcomingEvents,
  registerEvent,
  unregisterEvent,
};
