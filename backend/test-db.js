const mongoose = require('mongoose');

async function test() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/on_the_map', { serverSelectionTimeoutMS: 2000 });
    console.log('Connected!');

    const schema = new mongoose.Schema({
      tripId: String,
      tripName: String,
      customerName: String,
      customerEmail: String,
      customerPhone: String,
      guests: Number,
      date: Date,
      status: String
    });

    const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', schema);

    const res = new Reservation({
      tripId: "test",
      tripName: "test trip",
      customerName: "John",
      customerEmail: "john@example.com",
      customerPhone: "123",
      guests: 2,
      date: "August 15, 2026",
      status: "Pending"
    });

    await res.save();
    console.log('Saved successfully!');
    
    // Cleanup
    await Reservation.deleteOne({ _id: res._id });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

test();
