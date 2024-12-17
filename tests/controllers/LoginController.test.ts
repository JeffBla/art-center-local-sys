import {Request, Response} from 'express';
import LoginController from '../../src/controllers/LoginController';
import LoginModel from '../../src/models/LoginModel';

// Mock the LoginModel
jest.mock('../../src/models/LoginModel');

describe('LoginController', () => {
    let loginController: LoginController;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let loginModelMock: jest.Mocked<LoginModel>;

    beforeEach(() => {
        loginModelMock = new LoginModel() as jest.Mocked<LoginModel>;
        loginController = new LoginController();
        loginController['loginModel'] = loginModelMock;

        req = {
            body: {
                studentid: 'testStudentID',
                password: 'testPassword'
            }
        };

        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            cookie: jest.fn(),
            render: jest.fn()
        };
    });

    it('should return success true and set cookies if login is valid', async () => {
        const user = {
            username: 'testUser',
            studentID: 'testStudentID',
            password: 'testPassword',
            email: 'testEmail',
            phone: 'testPhone'
        };
        loginModelMock.checkLogin.mockResolvedValue(user);

        await loginController.login(req as Request, res as Response);

        expect(res.cookie).toHaveBeenCalledWith('username', user.username, {httpOnly: true});
        expect(res.cookie).toHaveBeenCalledWith('studentid', user.studentID, {httpOnly: true});
        expect(res.json).toHaveBeenCalledWith({success: true});
    });

    it('should return success false with message if login is invalid', async () => {
        loginModelMock.checkLogin.mockResolvedValue(null);

        await loginController.login(req as Request, res as Response);

        expect(res.json).toHaveBeenCalledWith({success: false, message: 'Incorrect username or password.'});
    });

    it('should return internal server error if an exception occurs', async () => {
        loginModelMock.checkLogin.mockRejectedValue(new Error('Test error'));

        await loginController.login(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({success: false, message: 'Internal server error.'});
    });

    it('should render login page', () => {
        loginController.loginPage(req as Request, res as Response);

        expect(res.render).toHaveBeenCalledWith('login');
    });

    it('should return logout message', () => {
        loginController.logout(req as Request, res as Response);

        expect(res.json).toHaveBeenCalledWith({message: 'You are logged out.'});
    });
});