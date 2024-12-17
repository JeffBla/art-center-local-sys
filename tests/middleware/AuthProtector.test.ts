import {Request, Response, NextFunction} from 'express';
import AuthProtector from '../../src/middleware/AuthProtector';

describe('AuthProtector', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            cookies: {}
        };
        res = {
            redirect: jest.fn()
        };
        next = jest.fn();
    });

    describe('ensureAuthenticated', () => {
        it('should call next if username and studentid cookies are present', () => {
            req.cookies = {username: 'JohnDoe', studentid: '1234'};

            AuthProtector.ensureAuthenticated(req as Request, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect(res.redirect).not.toHaveBeenCalled();
        });

        it('should redirect to "/" if username or studentid cookies are missing', () => {
            AuthProtector.ensureAuthenticated(req as Request, res as Response, next);

            expect(res.redirect).toHaveBeenCalledWith('/');
            expect(next).not.toHaveBeenCalled();
        });
    });
});