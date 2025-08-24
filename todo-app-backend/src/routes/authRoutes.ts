// routes/authRoutes.ts
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../app';
import { User } from '../entities/User';
import { hashPassword, comparePasswords, generateToken } from '../services/userService';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const router = Router();

// ✅ FIX: Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const isStrongPassword = (pwd: string) =>
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd); // ≥8, 1 uppercase, 1 number, 1 special

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials or password not set.' });
    }

    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials.' });

    if (user.isFirstLogin) {
  return res.status(200).json({
    message: 'First login detected. Password reset required.',
    requiresPasswordReset: true,
    isFirstLogin: true,
    email: user.email,
    nextStep: "reset", // ✅ tells frontend what to do next
  });
}

    const token = generateToken(user);
    res.status(200).json({
      message: 'Login successful.',
      token,
      role: user.role,
      isFirstLogin: false
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

router.post('/first-login-reset', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (!user.isFirstLogin) return res.status(400).json({ message: 'This endpoint is only for first-time login password reset.' });

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await userRepository.save(user);

    const verificationLink = `${process.env.FRONTEND_URL}/auth/otp-verification?email=${encodeURIComponent(email)}&type=first-login`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Password Reset - OTP Verification",
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>Click the link below to verify your OTP:</p>
        <a href="${verificationLink}" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Verify OTP</a>
        <p>Or copy this link: ${verificationLink}</p>
      `,
    });

    res.status(200).json({ message: 'OTP sent to your email. Please check your inbox.', email: user.email });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp, type } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const now = new Date();
    if (user.otp !== otp || (user.otpExpiry && user.otpExpiry < now)) {
      return res.status(401).json({ message: 'Invalid or expired OTP.' });
    }

    // NOTE: We do NOT clear OTP here; it will be consumed on set-new-password
    res.status(200).json({ message: 'OTP verified successfully.', verified: true, email: user.email, type: type || 'first-login' });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

router.post('/set-new-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword, type } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message: 'Weak password. Use at least 8 characters, one uppercase, one number, and one special character.'
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const now = new Date();
    if (user.otp !== otp || (user.otpExpiry && user.otpExpiry < now)) {
      return res.status(401).json({ message: 'Invalid or expired OTP.' });
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    user.tempPassword = null;
    if (type === 'first-login') user.isFirstLogin = false;

    await userRepository.save(user);

    res.status(200).json({ message: 'Password has been set successfully. You can now log in with your new password.', passwordSet: true });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.isFirstLogin) return res.status(400).json({ message: 'Please use the first-login flow to set your initial password.' });

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await userRepository.save(user);

    const verificationLink = `${process.env.FRONTEND_URL}/auth/otp-verification?email=${encodeURIComponent(email)}&type=forgot-password`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${verificationLink}" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a>
        <p>Or copy this link: ${verificationLink}</p>
      `,
    });

    res.status(200).json({ message: 'Password reset OTP sent to your email.', email: user.email });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

export default router;
