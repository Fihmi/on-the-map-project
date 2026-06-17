import { Request, Response } from 'express';
import { Reservation } from '../models/reservation.model';


export const createReservation = async (req: Request, res: Response) => {
  try {
    const { tripId, tripName, customerName, customerEmail, customerPhone, date } = req.body;

    if (!tripId || !tripName || !customerName || !customerPhone || !date) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const reservation = await Reservation.create({
      tripId,
      tripName,
      customerName,
      customerEmail: customerEmail || 'N/A',
      customerPhone,
      date,
      status: 'Not Paid',
    });

    res.status(201).json({ message: 'Reservation created successfully', reservation });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Server error creating reservation.' });
  }
};

export const getReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
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

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    res.status(200).json({ message: 'Reservation status updated successfully', reservation });
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ message: 'Server error updating reservation status.' });
  }
};

export const deleteReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByIdAndDelete(id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    res.status(200).json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ message: 'Server error deleting reservation.' });
  }
};



