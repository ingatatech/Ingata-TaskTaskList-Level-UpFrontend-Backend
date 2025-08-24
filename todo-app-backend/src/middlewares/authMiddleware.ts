//middlewares/authMiddlewares.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Extend the Express Request type to include the user property
interface AuthRequest extends Request {
  user?: { id: string; role: 'admin' | 'user' };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No authentication token, authorization denied.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: 'admin' | 'user' };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

// New middleware to check if the user is an admin
export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin role required.' });
  }
};