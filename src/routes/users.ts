import { Router } from 'express';
import UserController from '../controllers/UserController';

const router = Router();
const userController = new UserController();

/* GET users listing. */
router.get('/', userController.profilePage);
router.get('/select-service', userController.selectService);

export default router;
