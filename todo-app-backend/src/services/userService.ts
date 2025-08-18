import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    role: user.role,
    email: user.email,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};