import { Router } from 'express';
import { createReservation, getReservations, updateReservationStatus, deleteReservation } from '../controllers/reservation.controller';

const router = Router();

router.post('/', createReservation);
router.get('/', getReservations);
router.put('/:id/status', updateReservationStatus);
router.delete('/:id', deleteReservation);

export default router;
