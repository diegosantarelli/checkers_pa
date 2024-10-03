import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.sendStatus(401);  // Unauthorized
        return;
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
        if (err) {
            res.sendStatus(403);  // Forbidden
            return;
        }

        // Ci assicuriamo che req.user contenga solo i dati necessari (id e ruolo)
        if (typeof user === 'object' && user && 'id' in user && 'role' in user) {
            req.user = user as { id: string; role: string };
        } else {
            res.status(400).json({ message: 'Invalid token payload.' });
            return;
        }

        next();
    });
};
