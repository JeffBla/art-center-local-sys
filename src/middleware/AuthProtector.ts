import { Request, Response, NextFunction } from 'express';

class AuthProtector {
    static ensureAuthenticated(req: Request, res: Response, next: NextFunction): void {
        if (req.cookies.username && req.cookies.studentid) {
            return next();
        } else {
            res.redirect('/');
        }
    }
}

export default AuthProtector;