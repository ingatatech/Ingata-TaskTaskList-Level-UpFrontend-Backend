import { Router, Request, Response } from 'express';
import { AppDataSource } from '../app';
import { User } from '../entities/User';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';
import { ILike } from 'typeorm';
import crypto from 'crypto';

// Extend the Express Request type for middleware
interface AuthRequest extends Request {
  user?: { id: string; role: 'admin' | 'user' };
}

const router = Router();

// --- Create user with OTP ---
router.post('/users/create', async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = userRepository.create({
      email,
      role: role || 'user',
      otp,
      otpExpiry,
      password: '',
    });
    await userRepository.save(user);

    console.log(`OTP for ${email}: ${otp}`);
    res.status(201).json({ message: 'User created successfully. OTP sent to email.', user: { email: user.email, role: user.role } });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// --- Count all users ---
router.get('/users/count', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const total = await userRepository.count();
    res.status(200).json({ total });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// --- Count active users (NEW) ---
router.get('/users/count/active', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const activeCount = await userRepository.count({ where: { status: 'active' } });
    res.status(200).json({ total: activeCount });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// --- Get paginated users ---
router.get('/users', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 5, email, role, status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const userRepository = AppDataSource.getRepository(User);

    let whereCondition: any = {};
    if (email) whereCondition.email = ILike(`%${email}%`);
    if (role) whereCondition.role = role;
    if (status) whereCondition.status = status;

    const [users, total] = await userRepository.findAndCount({
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
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// --- Get single user ---
router.get('/users/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(user);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// --- Update user ---
router.put('/users/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, role, status } = req.body;
    const userRepository = AppDataSource.getRepository(User);
    const userToUpdate = await userRepository.findOne({ where: { id } });

    if (!userToUpdate) return res.status(404).json({ message: 'User not found.' });

    userToUpdate.email = email ?? userToUpdate.email;
    userToUpdate.role = role ?? userToUpdate.role;
    userToUpdate.status = status ?? userToUpdate.status;

    await userRepository.save(userToUpdate);
    res.status(200).json({ message: 'User updated successfully.', user: userToUpdate });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// --- Delete user ---
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository(User);
    const result = await userRepository.delete(id);

    if (result.affected === 0) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

export default router;
