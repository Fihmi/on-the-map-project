import mongoose, { Document, Schema } from 'mongoose';

export interface IReservation extends Document {
  tripId: string;
  tripName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  status: 'Not Paid' | 'Pending' | 'Paid';
  price?: number;
  amountPaid?: number;
}

const reservationSchema = new Schema<IReservation>(
  {
    tripId: { type: String, required: true },
    tripName: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, default: 'N/A' },
    customerPhone: { type: String, required: true },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ['Not Paid', 'Pending', 'Paid'],
      default: 'Not Paid',
    },
    price: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
  }, 
  {
    timestamps: true,
  }
);

export const Reservation = mongoose.model<IReservation>('Reservation', reservationSchema);
