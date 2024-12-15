import { Router } from 'express';
import LoginController from '../controllers/LoginController';

const router = Router();
const loginController = new LoginController();

router.get('/', loginController.loginPage);
router.post('/login', loginController.login);
router.post('/logout',  loginController.logout);

export default router;