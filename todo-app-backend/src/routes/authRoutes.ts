import { Router, Request, Response } from 'express';
import { AppDataSource } from '../app';
import { User } from '../entities/User';
import { hashPassword, comparePasswords, generateToken } from '../services/userService';

const router = Router();

// Endpoint for OTP verification and password setup
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if OTP matches and is not expired
    const now = new Date();
    if (user.otp !== otp || (user.otpExpiry && user.otpExpiry < now)) {
      return res.status(401).json({ message: 'Invalid or expired OTP.' });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password and clear OTP fields
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await userRepository.save(user);

    res.status(200).json({ message: 'Password has been set successfully. You can now log in.' });

  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Updated endpoint for user login to return the user's role
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    // Check if user exists and has a password set
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials or password not set.' });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // If credentials are valid, generate a JWT token
    const token = generateToken(user);

    // Return the token AND the user's role to the client
    res.status(200).json({ message: 'Login successful.', token, role: user.role });

  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

export default router;
