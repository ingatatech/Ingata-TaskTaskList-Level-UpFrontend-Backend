import { Router, Request, Response } from 'express';
import { AppDataSource } from '../app';
import { User } from '../entities/User';
import { hashPassword, comparePasswords, generateToken } from '../services/userService';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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

const isStrongPassword = (pwd: string) =>
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd); // ≥8, 1 uppercase, 1 number, 1 special

// --- Login ---
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials.' });

    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials.' });

    if (user.isFirstLogin) {
      return res.status(200).json({
        message: 'First login detected. Password reset required.',
        requiresPasswordReset: true,
        isFirstLogin: true,
        email: user.email,
        nextStep: "reset",
      });
    }

    const token = generateToken(user);
    res.status(200).json({ message: 'Login successful.', token, role: user.role, isFirstLogin: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// --- First-login password reset ---
router.post('/first-login-reset', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (!user.isFirstLogin) return res.status(400).json({ message: 'Use standard forgot-password flow.' });

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
      html: `<p>Your OTP is <strong>${otp}</strong>. Expires in 10 minutes. <a href="${verificationLink}">Verify OTP</a></p>`
    });

    res.status(200).json({ message: 'OTP sent to your email.', email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// --- Forgot Password ---
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.isFirstLogin) return res.status(400).json({ message: 'Please use first-login flow first.' });

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
      html: `<p>Your OTP is <strong>${otp}</strong>. Expires in 10 minutes. <a href="${verificationLink}">Reset Password</a></p>`
    });

    res.status(200).json({ message: 'Password reset OTP sent to your email.', email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// --- Verify OTP ---
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp, type } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required.' });

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.otp !== otp || (user.otpExpiry && user.otpExpiry < new Date())) {
      return res.status(401).json({ message: 'Invalid or expired OTP.' });
    }

    res.status(200).json({ message: 'OTP verified.', verified: true, email: user.email, type: type || 'first-login' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// --- Set New Password ---
router.post('/set-new-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword, type } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Email, OTP, and new password required.' });
    if (!isStrongPassword(newPassword)) return res.status(400).json({ message: 'Weak password.' });

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.otp !== otp || (user.otpExpiry && user.otpExpiry < new Date())) {
      return res.status(401).json({ message: 'Invalid or expired OTP.' });
    }

    user.password = await hashPassword(newPassword);
    user.otp = null;
    user.otpExpiry = null;
    user.tempPassword = null;
    if (type === 'first-login') user.isFirstLogin = false;

    await userRepository.save(user);
    res.status(200).json({ message: 'Password updated successfully.', passwordSet: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
