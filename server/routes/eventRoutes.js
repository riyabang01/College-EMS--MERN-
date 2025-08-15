const express = require('express');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const path = require('path');
const mongoose = require('mongoose');


const router = express.Router();

// ✅ Serve static files for uploaded images
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ✅ Create an event with image upload (Admin only)
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  const { title, description, date, location } = req.body;

  try {
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const event = await Event.create({
      title,
      description,
      date,
      location,
      image,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('❌ Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// ✅ Get all events (Admin only)
router.get('/admin-events', protect, admin, async (req, res) => {
  try {
    const events = await Event.find({});
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});


// ✅ Get all events (Admin sees all, users see their own)
router.get('/', protect, async (req, res) => {
  try {
    const events = req.user.role === 'admin' 
      ? await Event.find() 
      : await Event.find({ createdBy: req.user._id });

    res.json(events);
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});


// ✅ Get all upcoming events (Visible to all logged-in users)
router.get('/upcoming', protect, async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } });

    // ✅ Include registration status
    const formattedEvents = events.map(event => ({
      id: event._id || event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      image: event.image ? `${req.protocol}://${req.get('host')}${event.image}` : null,
      totalRegistrants: event.registeredUsers.length,
      isRegistered: event.registeredUsers.includes(req.user._id), // ✅ Registration status
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error('❌ Error fetching upcoming events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// ✅ Register for an event
router.post('/:id/register', protect, async (req, res) => {
  try {
    const eventId = String(req.params.id); // ✅ Convert to String
    console.log("🔎 Registering for event ID:", eventId);

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.registeredUsers.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already registered for this event' });
    }

    event.registeredUsers.push(req.user._id);
    await event.save();

    console.log("✅ Registered successfully!");
    res.status(200).json({ message: 'Successfully registered for the event' });
  } catch (error) {
    console.error('❌ Error registering for event:', error);
    res.status(500).json({ message: 'Failed to register for the event' });
  }
});


// ✅ Unregister from an event
router.delete('/:id/unregister', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.registeredUsers = event.registeredUsers.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );

    await event.save();

    res.json({ message: 'Successfully unregistered from the event' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unregister from the event' });
  }
});

// ✅ Get available events with registration status
router.get('/available', protect, async (req, res) => {
  try {
    const events = await Event.find();

    const formattedEvents = events.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      image: event.image ? `${req.protocol}://${req.get('host')}${event.image}` : null,
      totalRegistrants: event.registeredUsers.length,
      isRegistered: event.registeredUsers.includes(req.user._id),
    }));

    res.json(formattedEvents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch available events' });
  }
});



// ✅ Get my registered events 
router.get('/myevents', protect, async (req, res) => {
  try {
    const events = await Event.find({ 
      registeredUsers: { $in: [new mongoose.Types.ObjectId(req.user._id)] }
    });

    res.json(events);
  } catch (error) {
    console.error('❌ Error fetching registered events:', error);
    res.status(500).json({ message: 'Failed to fetch registered events' });
  }
});


// ✅ Update an event (Admin only)
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  const { title, description, date, location } = req.body;

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.location = location || event.location;

    if (req.file) {
      event.image = `/uploads/${req.file.filename}`;
    }

    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// ✅ Delete an event (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

// ✅ Mark attendees (Admin only)
router.put('/:id/attendees', protect, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const { attendees } = req.body;
    event.attendees = [...new Set([...event.attendees, ...attendees])];
    await event.save();

    res.json({ message: 'Attendees updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update attendees' });
  }
});

// ✅ Get registrants for a specific event (Admin only)
router.get('/:eventId/registrants', protect, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('registeredUsers', 'name');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event.registeredUsers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch registrants' });
  }
});

module.exports = router;
