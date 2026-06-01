import { Request, Response } from 'express';
// import { Reservation } from '../models/reservation.model';
import { readDB, writeDB, ReservationDB } from '../utils/jsonDb';

export const createReservation = async (req: Request, res: Response) => {
  try {
    const { tripId, tripName, customerName, customerEmail, customerPhone, date } = req.body;

    if (!tripId || !tripName || !customerName || !customerPhone || !date) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const db = readDB();

    const reservation: ReservationDB = {
      _id: Date.now().toString(),
      tripId,
      tripName,
      customerName,
      customerEmail: customerEmail || 'N/A',
      customerPhone,
      date,
      status: 'Not Paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.reservations.push(reservation);
    writeDB(db);

    res.status(201).json({ message: 'Reservation created successfully', reservation });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Server error creating reservation.' });
  }
};

export const getReservations = async (req: Request, res: Response) => {
  try {
    const db = readDB();
    const reservations = db.reservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Server error fetching reservations.' });
  }
};

export const updateReservationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const db = readDB();
    const reservationIndex = db.reservations.findIndex(r => r._id === id);

    if (reservationIndex === -1) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    db.reservations[reservationIndex].status = status;
    db.reservations[reservationIndex].updatedAt = new Date().toISOString();
    writeDB(db);

    res.status(200).json({ message: 'Reservation status updated successfully', reservation: db.reservations[reservationIndex] });
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ message: 'Server error updating reservation status.' });
  }
};

export const deleteReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const db = readDB();
    const reservationIndex = db.reservations.findIndex(r => r._id === id);

    if (reservationIndex === -1) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    db.reservations.splice(reservationIndex, 1);
    writeDB(db);

    res.status(200).json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ message: 'Server error deleting reservation.' });
  }
};
