import {Request, Response} from 'express';
import UserModel from '../models/UserModel';

class UserController {
    private userModel: UserModel;

    constructor() {
        this.userModel = new UserModel();
        this.profilePage = this.profilePage.bind(this);
        this.userEvent = this.userEvent.bind(this);
        this.userInfo = this.userInfo.bind(this);
    }

    public profilePage(req: Request, res: Response): void {
        res.render('profile');
    }

    public async userEvent(req: Request, res: Response): Promise<void> {
        const username = req.cookies.username;
        if (!username) {
            res.status(400).json({error: 'Username is required'});
            return;
        }

        const events = await this.userModel.getUserEventsDetail(username as string) || [];

        res.json(events);
    }

    public async userInfo(req: Request, res: Response): Promise<void> {
        const studentID = req.cookies.studentid;
        if (!studentID) {
            res.status(400).json({error: 'Student ID is required'});
            return;
        }

        const user = await this.userModel.getUserDetails(studentID as string);

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({error: 'User not found'});
        }

    }
}

export default UserController;