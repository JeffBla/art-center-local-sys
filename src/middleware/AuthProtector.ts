import { Request, Response, NextFunction } from 'express';

class AuthProtector {
    static ensureAuthenticated(req: Request, res: Response, next: NextFunction): void {
        if (req.cookies.username) {
            return next();
        } else {
            res.redirect('/login');
        }
    }
}

export default AuthProtector;