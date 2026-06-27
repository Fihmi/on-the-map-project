import { Request, Response } from 'express';
import { Reservation } from '../models/reservation.model';


export const createReservation = async (req: Request, res: Response) => {
  try {
    const { tripId, tripName, customerName, customerEmail, customerPhone, date, price, amountPaid, status } = req.body;

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
      status: status || 'Not Paid',
      price: price !== undefined ? price : 0,
      amountPaid: amountPaid !== undefined ? amountPaid : 0,
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
    const { status, price, amountPaid } = req.body;

    const updateFields: any = {};
    if (status !== undefined) updateFields.status = status;
    if (price !== undefined) updateFields.price = price;
    if (amountPaid !== undefined) updateFields.amountPaid = amountPaid;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      updateFields,
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



