const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const config = require('../config/config');
const { sendOTP, sendPasswordResetEmail } = require('../utils/email');
const { generateOTP, generateResetToken } = require('../utils/otp');

// Unified Authentication
const register = async (req, res) => {
  try {
    const { name, email, password, userType, organizationType, skills } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userType,
        organizationType: userType === 'TaskProvider' ? organizationType : null,
        skills: userType === 'Worker' ? (skills || []) : [],
        otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      }
    });

    // Send OTP email
    await sendOTP(email, otp);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      userId: user.id
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(user);

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({ error: 'Please verify your email first' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, userType: user.userType },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        organizationType: user.organizationType,
        skills: user.skills
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.otp !== otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        otp: null,
        otpExpiry: null
      }
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Verification failed' });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOTP();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000)
      }
    });

    await sendOTP(email, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Update user with new OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      }
    });

    // Send OTP email
    await sendOTP(email, otp);

    res.json({ message: 'OTP sent successfully for password reset' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process password reset' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.otp !== otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiry: null
      }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

module.exports = {
  register,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword
}; 