import { Request, Response } from 'express';
import UserModel from '../models/UserModel';

class UserController {
    private userModel: UserModel;

    constructor() {
        this.userModel = new UserModel();
    }

    public profilePage(req: Request, res: Response): void {
        res.render('profile');
    }

    public selectService(req: Request, res: Response): void {
        res.render('select'); // Adjust the path to your select-service.html file
    }
}

export default UserController;