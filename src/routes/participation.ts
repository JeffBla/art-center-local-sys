import {Router} from 'express';
import {ParticipationController} from '../controllers/ParticipationController';

const router = Router();
const participationController = new ParticipationController();

router.post('/select-event', participationController.selectEvent);
router.post('/cancel-event', participationController.removeEvent);

export default router;