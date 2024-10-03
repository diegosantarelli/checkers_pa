import express from 'express';
import { addPlayer, getPlayers } from '../controllers/gameController';

const router = express.Router();

router.post('/addplayers', addPlayer);
router.get('/getplayers', getPlayers);

export default router;