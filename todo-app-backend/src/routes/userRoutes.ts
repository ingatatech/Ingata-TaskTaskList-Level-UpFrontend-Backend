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

// This is the admin endpoint to create a user and send an OTP.
// This endpoint no longer requires an authentication token, allowing for initial admin setup.
router.post('/users/create', async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;

    // Check if user already exists
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create a temporary user with the OTP
    const user = userRepository.create({
      email,
      role: role || 'user',
      otp,
      otpExpiry,
      password: '', // Password will be set after OTP verification
    });
    await userRepository.save(user);

    // Send OTP via email (for now, we'll just log it)
    console.log(`OTP for ${email}: ${otp}`);

    res.status(201).json({ message: 'User created successfully. OTP sent to email.', user: { email: user.email, role: user.role } });

  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// The following admin-specific endpoints are properly protected.
router.get('/users', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, email, role, status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const userRepository = AppDataSource.getRepository(User);

    let whereCondition: any = {};

    if (email) {
      whereCondition.email = ILike(`%${email}%`);
    }
    if (role) {
      whereCondition.role = role;
    }
    if (status) {
      whereCondition.status = status;
    }

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

router.get('/users/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

router.put('/users/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, role, status } = req.body;
    const userRepository = AppDataSource.getRepository(User);
    const userToUpdate = await userRepository.findOne({ where: { id } });

    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found.' });
    }

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

router.delete('/users/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository(User);
    const result = await userRepository.delete(id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

export default router;
