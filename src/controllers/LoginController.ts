import {Request, Response} from 'express';
import LoginModel from '../models/LoginModel';

class LoginController {
    private loginModel: LoginModel;

    constructor() {
        this.loginModel = new LoginModel();
        this.loginPage = this.loginPage.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }

    public loginPage(req: Request, res: Response): void {
        res.render('login');
    }

    public async login(req: Request, res: Response): Promise<void> {
        const {studentid, password} = req.body;
        try {
            const user = await this.loginModel.checkLogin(studentid, password);
            if (user) {
                res.cookie('username', user?.username, {httpOnly: true});
                res.cookie('studentid', user?.studentID, {httpOnly: true});
                res.json({success: true});
            } else {
                console.log('Incorrect username or password.');
                res.json({success: false, message: 'Incorrect username or password.'});
            }
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({success: false, message: 'Internal server error.'});
        }
    }

    public logout(req: Request, res: Response): void {
        // Implement logout logic if needed
        res.json({message: 'You are logged out.'});
    }
}

export default LoginController;