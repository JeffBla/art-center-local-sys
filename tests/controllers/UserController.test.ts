import {Request, Response} from "express";
import UserController from "../../src/controllers/UserController";
import UserModel from "../../src/models/UserModel";

jest.mock("../../src/models/UserModel");

describe('UserController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let userController: UserController;

    beforeEach(() => {
        req = {
            cookies: {}
        };
        res = {
            json: jest.fn(),
            render: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        userController = new UserController();
    });

    describe('profilePage', () => {
        it('should render the profile page', () => {
            userController.profilePage(req as Request, res as Response);

            expect(res.render).toHaveBeenCalledWith('profile');
        });
    });

    describe('userEvent', () => {
        it('should return 400 if username is not provided', async () => {
            await userController.userEvent(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error: 'Username is required'});
        });

        it('should return user events if username is provided', async () => {
            const mockEvents = [{id: 1, name: 'Event 1'}];
            req.cookies = {username: 'JohnDoe'};
            (UserModel.prototype.getUserEventsDetail as jest.Mock).mockResolvedValue(mockEvents);

            await userController.userEvent(req as Request, res as Response);

            expect(res.json).toHaveBeenCalledWith(mockEvents);
        });
    });

    describe('userInfo', () => {
        it('should return 400 if studentID is not provided', async () => {
            await userController.userInfo(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error: 'Student ID is required'});
        });
    });
});