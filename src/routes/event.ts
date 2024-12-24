import {Router} from 'express';
import EventController from '../controllers/EventController';

const router = Router();
const eventController = new EventController();

router.get('/', eventController.renderMainPage);
router.get('/select', eventController.renderSelectPage);
router.post('/select-event', eventController.selectEvent);
router.post('/events', eventController.displayEvents);
router.post('/eventinfo', eventController.getEventInfo);
router.post('/unavailable', eventController.getUnavailableEvents);
router.post('/cancel-event', eventController.removeEvent);

export default router;