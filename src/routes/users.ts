import { Router } from 'express';
import UserController from '../controllers/UserController';

const router = Router();
const userController = new UserController();

/* GET users listing. */
router.get('/', userController.profilePage);
router.post('/event', userController.userEvent);
router.post('/info', userController.userInfo);

export default router;
