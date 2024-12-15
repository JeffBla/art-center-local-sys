import {Router} from 'express';
import EventController from '../controllers/EventController';

const router = Router();
const eventController = new EventController();

router.post('/events', eventController.displayEvents);
router.get('/', eventController.renderMainPage);

export default router;