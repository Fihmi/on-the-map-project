import { Router } from 'express';
import { createReservation, getReservations, updateReservationStatus, deleteReservation } from '../controllers/reservation.controller';
import { adminProtect } from '../middleware/admin.middleware';

const router = Router();

router.post('/', createReservation);
router.get('/', adminProtect, getReservations);
router.put('/:id/status', adminProtect, updateReservationStatus);
router.delete('/:id', adminProtect, deleteReservation);

export default router;
