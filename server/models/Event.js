const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  image: { type: String }, // URL for the event image
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // ✅ Fixed field name
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
