const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const config = require('../config/config');
const { sendOTP, sendPasswordResetEmail } = require('../utils/email');
const { generateOTP, generateResetToken } = require('../utils/otp');
const { decryptPayload, encryptPayload } = require('../utils/crypto');
const { sendNotification } = require('../utils/notificationService');


// Unified Authentication
const register = async (req, res) => {
  try {
    const { name, email, password, userType, organizationType, skills } = decryptPayload(req.body.encryptedPayload);
 

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
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


    res.status(201).json(encryptPayload({
      message: 'Registration successful. Please verify your email.',
      userId: user.id
    }));
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = decryptPayload(req.body.encryptedPayload);
    console.log("req.body.encryptedPayload",req.body.encryptedPayload);
    console.log("email",email);
    console.log("password",password);

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
      { expiresIn: '100h' }
    );
    await sendNotification({
      receiverId: user.id,
      heading: 'Login Successful',
      message: `Hello ${user.name}, you have logged in successfully.`,
      senderId: 'AuthSystem',
      sendMail:true,
      email: user.email,
    });
    const encryptedPayload = encryptPayload({
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
    res.json(encryptedPayload);
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = decryptPayload(req.body.encryptedPayload);

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
    const { email } = decryptPayload(req.body.encryptedPayload);

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
    const { email } = decryptPayload(req.body.encryptedPayload);

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
    const { email, otp, newPassword } = decryptPayload(req.body.encryptedPayload);

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

const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        organizationType: true,
        skills: true,
        balance: true,
        createdAt: true,
        isEmailVerified: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
 
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

/**
 * Get notifications for a specific user
 * Only returns notifications that haven't expired
 */
const getUserNotifications = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const now = new Date();
    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: userId,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};



module.exports = {
  register,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  getUserProfile,
  getUserNotifications,
}; 