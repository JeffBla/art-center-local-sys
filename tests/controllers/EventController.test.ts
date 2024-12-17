import {Request, Response} from 'express';
import EventController from '../../src/controllers/EventController';
import EventModel from '../../src/models/EventModel';

jest.mock('../../src/models/EventModel');

describe('EventController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let eventController: EventController;

    beforeEach(() => {
        req = {
            cookies: {}
        };
        res = {
            json: jest.fn(),
            render: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        eventController = new EventController();
    });

    describe('displayEvents', () => {
        it('should return event data as JSON', async () => {
            const mockEventData = [{id: 1, name: 'Event 1'}];
            (EventModel.prototype.getEventSheetData as jest.Mock).mockResolvedValue(mockEventData);

            await eventController.displayEvents(req as Request, res as Response);

            expect(res.json).toHaveBeenCalledWith(mockEventData);
        });

        it('should handle errors and return 500 status', async () => {
            const mockError = new Error('Test error');
            (EventModel.prototype.getEventSheetData as jest.Mock).mockRejectedValue(mockError);

            await eventController.displayEvents(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.render).toHaveBeenCalledWith('error', {message: 'Internal server error.'});
        });
    });

    describe('renderMainPage', () => {
        it('should render main page with username and studentid from cookies', async () => {
            req.cookies = {username: 'JohnDoe', studentid: '1234'};

            await eventController.renderMainPage(req as Request, res as Response);

            expect(res.render).toHaveBeenCalledWith('main', {username: 'JohnDoe', studentid: '1234'});
        });

        it('should render main page with default values if cookies are not set', async () => {
            await eventController.renderMainPage(req as Request, res as Response);

            expect(res.render).toHaveBeenCalledWith('main', {username: 'Guest', studentid: '0000'});
        });

        it('should handle errors and return 500 status', async () => {
            const mockError = new Error('Test error');
            res.render = jest.fn().mockImplementation(() => { throw mockError; });

            try {
                await eventController.renderMainPage(req as Request, res as Response);
            } catch (error) {
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.render).toHaveBeenCalledWith('error', { message: 'Internal server error.' });
            }
        });
    });
});