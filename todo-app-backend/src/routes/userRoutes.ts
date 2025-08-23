import { Router, Request, Response } from 'express';
import { AppDataSource } from '../app';
import { User } from '../entities/User';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';
import { ILike } from 'typeorm';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Extend the Express Request type for middleware
interface AuthRequest extends Request {
  user?: { id: string; role: 'admin' | 'user' };
}

const router = Router();

// --- Nodemailer transporter for real emails ---
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465, // true for SSL, false for TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- Create user with OTP ---
router.post('/users/create', async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    const userRepository = AppDataSource.getRepository(User);

    // Check if user exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // Generate OTP and expiry
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Create user
    const user = userRepository.create({
      email,
      role: role || 'user',
      otp,
      otpExpiry,
      password: '',
    });
    await userRepository.save(user);

    // Send OTP email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Your OTP Code",
        text: `Hello,\n\nYour OTP code is: ${otp}\nIt will expire in 10 minutes.\n\nThank you!`,
      });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({ message: 'Failed to send OTP email', error: emailError });
    }

    res.status(201).json({
      message: 'User created successfully. OTP sent to user email.',
      user: { email: user.email, role: user.role }
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// --- Count all users ---
router.get('/users/count', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const total = await AppDataSource.getRepository(User).count();
    res.status(200).json({ total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// --- Count active users ---
router.get('/users/count/active', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const activeCount = await AppDataSource.getRepository(User).count({ where: { status: 'active' } });
    res.status(200).json({ total: activeCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// --- Get paginated users ---
router.get('/users', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 5, email, role, status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereCondition: any = {};
    if (email) whereCondition.email = ILike(`%${email}%`);
    if (role) whereCondition.role = role;
    if (status) whereCondition.status = status;

    const [users, total] = await AppDataSource.getRepository(User).findAndCount({
      where: whereCondition,
      skip,
      take: parseInt(limit as string),
      order: { createdAt: 'DESC' },
    });

    res.status(200).json({
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// --- Get single user ---
router.get('/users/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await AppDataSource.getRepository(User).findOne({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// --- Update user ---
router.put('/users/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { email, role, status } = req.body;
    const userRepository = AppDataSource.getRepository(User);
    const userToUpdate = await userRepository.findOne({ where: { id: req.params.id } });
    if (!userToUpdate) return res.status(404).json({ message: 'User not found.' });

    userToUpdate.email = email ?? userToUpdate.email;
    userToUpdate.role = role ?? userToUpdate.role;
    userToUpdate.status = status ?? userToUpdate.status;

    await userRepository.save(userToUpdate);
    res.status(200).json({ message: 'User updated successfully.', user: userToUpdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// --- Delete user ---
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await AppDataSource.getRepository(User).delete(req.params.id);
    if (result.affected === 0) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
