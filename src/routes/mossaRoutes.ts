import express from 'express';
import mossaController from '../controllers/mossaController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

router.post('/mossa', authenticateJWT, mossaController.move);

export default router;