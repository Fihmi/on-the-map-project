import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import reservationRoutes from './routes/reservation.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();

// Connect to MongoDB (Commented out for JSON DB testing)
// connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for local development flexibility
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
