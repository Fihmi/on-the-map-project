import mongoose, { Document, Schema } from 'mongoose';

export interface IReservation extends Document {
  tripId: string;
  tripName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  guests: number;
  date: Date;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
}

const reservationSchema = new Schema<IReservation>(
  {
    tripId: { type: String, required: true },
    tripName: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    guests: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Reservation = mongoose.model<IReservation>('Reservation', reservationSchema);
