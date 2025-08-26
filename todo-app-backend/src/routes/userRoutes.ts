// ===== BACKEND: Modified routes/userRoutes.ts =====
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../app';
import { User } from '../entities/User';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';
import { ILike } from 'typeorm';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { hashPassword } from '../services/userService';

interface AuthRequest extends Request {
  user?: { id: string; role: 'admin' | 'user' };
}

const router = Router();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// *** NEW: CHECK ADMIN EXISTS ENDPOINT ***
router.get('/admin/exists', async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const adminExists = await userRepository.findOne({ 
      where: { role: 'admin' },
      select: ['id'] // Only select id for performance
    });
    
    res.status(200).json({ 
      adminExists: !!adminExists,
      canAssignAdmin: !adminExists
    });
  } catch (error) {
    console.error('Error checking admin existence:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// *** UPDATED: CREATE USER WITH ADMIN CHECK LOGIC ***
router.post('/users/create', async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    const userRepository = AppDataSource.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // *** NEW LOGIC: Check if admin already exists ***
    const adminExists = await userRepository.findOne({ 
      where: { role: 'admin' },
      select: ['id']
    });

    // Determine final role based on admin existence
    let finalRole: 'admin' | 'user' = 'user'; // Default to user
    
    if (!adminExists) {
      // No admin exists, allow the requested role (admin or user)
      finalRole = role && (role === 'admin' || role === 'user') ? role : 'user';
    } else {
      // Admin exists, force role to be 'user'
      finalRole = 'user';
      
      // If they tried to create an admin when one exists, return warning
      if (role === 'admin') {
        return res.status(400).json({ 
          message: 'Cannot create admin user. An administrator already exists in the system.',
          adminExists: true
        });
      }
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedTempPassword = await hashPassword(tempPassword);

    // Create user with determined role
    const user = userRepository.create({
      email,
      role: finalRole,
      password: hashedTempPassword,
      isFirstLogin: true,
      otp: null,
      otpExpiry: null,
    });

    await userRepository.save(user);

    // Send credentials email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Welcome! Your Login Credentials",
        html: `
          <h2>Welcome to Our Platform!</h2>
          <p>Your account has been created successfully.</p>
          <p><strong>Login Credentials:</strong></p>
          <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Temporary Password:</strong> ${tempPassword}</li>
            <li><strong>Role:</strong> ${finalRole}</li>
          </ul>
          <p><em>Note: You will be required to set a new password after your first login.</em></p>
          <p>Please login at: <a href="${process.env.FRONTEND_URL}/auth/login">${process.env.FRONTEND_URL}/auth/login</a></p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send credentials email:', emailError);
      return res.status(500).json({ 
        message: 'User created but failed to send credentials email', 
        error: emailError 
      });
    }

    res.status(201).json({
      message: `User created successfully with role: ${finalRole}. Login credentials sent to user email.`,
      user: { 
        email: user.email, 
        role: user.role,
        assignedRole: finalRole,
        adminExists: !!adminExists
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// ... (rest of the routes remain the same)
// COUNT ALL USERS
router.get('/users/count', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const total = await AppDataSource.getRepository(User).count();
    res.status(200).json({ total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// COUNT ACTIVE USERS
router.get('/users/count/active', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const activeCount = await AppDataSource.getRepository(User).count({ where: { status: 'active' } });
    res.status(200).json({ total: activeCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET PAGINATED USERS
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

// GET SINGLE USER
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

// UPDATE USER
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

// DELETE USER (CASCADE TASKS AUTOMATICALLY)
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await userRepository.remove(user); // Tasks will be deleted automatically because of cascade
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;