const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const config = require('../config/config');
const { sendOTP, sendPasswordResetEmail } = require('../utils/email');
const { generateOTP, generateResetToken } = require('../utils/otp');

// Task Provider Authentication
const registerTaskProvider = async (req, res) => {
  try {
    const { name, email, password, organizationType } = req.body;

    // Check if email already exists
    const existingProvider = await prisma.taskProvider.findUnique({
      where: { email }
    });

    if (existingProvider) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();

    // Create task provider
    const taskProvider = await prisma.taskProvider.create({
      data: {
        name,
        email,
        password: hashedPassword,
        organizationType: organizationType,
        otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      }
    });

    // Send OTP email
    await sendOTP(email, otp);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      userId: taskProvider.id
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const verifyTaskProviderOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const taskProvider = await prisma.taskProvider.findUnique({
      where: { email }
    });

    if (!taskProvider) {
      return res.status(404).json({ error: 'Task provider not found' });
    }

    if (taskProvider.otp !== otp || new Date() > taskProvider.otpExpiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Update task provider as verified
    await prisma.taskProvider.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null
      }
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

const loginTaskProvider = async (req, res) => {
  try {
    const { email, password } = req.body;

    const taskProvider = await prisma.taskProvider.findUnique({
      where: { email }
    });

    if (!taskProvider) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, taskProvider.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!taskProvider.isVerified) {
      return res.status(401).json({ error: 'Please verify your email first' });
    }

    const token = jwt.sign(
      { userId: taskProvider.id, userType: 'taskProvider' },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: taskProvider.id,
        name: taskProvider.name,
        email: taskProvider.email,
        organizationType: taskProvider.organizationType
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Worker Authentication
const registerWorker = async (req, res) => {
  try {
    const { fullName, email, password, skills } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if email already exists
    const existingWorker = await prisma.worker.findUnique({
      where: {
        email: email
      }
    });

    if (existingWorker) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();

    // Create worker
    const worker = await prisma.worker.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        skills: skills || [],
        otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      }
    });

    // Send OTP email
    await sendOTP(email, otp);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      userId: worker.id
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const verifyWorkerOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const worker = await prisma.worker.findUnique({
      where: { email }
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    if (worker.otp !== otp || new Date() > worker.otpExpiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Update worker as verified
    await prisma.worker.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null
      }
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Verification failed' });
  }
};

const loginWorker = async (req, res) => {
  try {
    const { email, password } = req.body;

    const worker = await prisma.worker.findUnique({
      where: { email }
    });

    if (!worker) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, worker.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!worker.isVerified) {
      return res.status(401).json({ error: 'Please verify your email first' });
    }

    const token = jwt.sign(
      { userId: worker.id, userType: 'worker' },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: worker.id,
        fullName: worker.fullName,
        email: worker.email,
        skills: worker.skills
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Password Reset
const forgotPasswordTaskProvider = async (req, res) => {
  try {
    const { email } = req.body;

    const taskProvider = await prisma.taskProvider.findUnique({
      where: { email }
    });

    if (!taskProvider) {
      return res.status(404).json({ error: 'Task provider not found' });
    }

    const otp = generateOTP();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour




    await prisma.taskProvider.update({
      where: { email },
      data: {
        otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000)
      }
    });

    await sendOTP(email, otp);

    // await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'OTP sended' });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Password reset failed' });
  }
};

const forgotPasswordWorker = async (req, res) => {
  try {
    const { email } = req.body;
    const worker = await prisma.worker.findUnique({ where: { email } });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const otp = generateOTP();
    // const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.worker.update({
      where: { email },
      data: {
        otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000)
      }
    });

    await sendOTP(email, otp);
    res.json({ message: 'Reset opt sended' });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
};

// Reset Password (Worker)
const resetPasswordWorker = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const worker = await prisma.worker.findFirst({
      where: { email, otp, otpExpiry: { gt: new Date() } }
    });

    if (!worker) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.worker.update({
      where: { id: worker.id },
      data: { password: hashedPassword, otp: null, otpExpiry: null }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
};

const resetPasswordTaskProvider = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const taskProvider = await prisma.taskProvider.findFirst({
      where: { email, otp, otpExpiry: { gt: new Date() } }
    });

    if (!taskProvider) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.taskProvider.update({
      where: { id: taskProvider.id },
      data: { password: hashedPassword, otp: null, otpExpiry: null }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
};

const resendVerifyWorkerOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const worker = await prisma.worker.findUnique({
      where: { email }
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Generate new OTP
    const otp = generateOTP();

    // Update worker with new OTP
    await prisma.worker.update({
      where: { email },
      data: {
        otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      }
    });

    // Send OTP email
    await sendOTP(email, otp);

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

const resendTaskProviderOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);

    const taskProvider = await prisma.taskProvider.findUnique({
      where: { email }
    });

    if (!taskProvider) {
      return res.status(404).json({ error: 'Task provider not found' });
    }

    // Generate new OTP
    const otp = generateOTP();

    // Update task provider with new OTP
    await prisma.taskProvider.update({
      where: { email },
      data: {
        otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      }
    });

    // Send OTP email
    await sendOTP(email, otp);

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

module.exports = {
  registerTaskProvider,
  verifyTaskProviderOTP,
  loginTaskProvider,
  registerWorker,
  verifyWorkerOTP,
  loginWorker,
  forgotPasswordTaskProvider,
  resetPasswordTaskProvider,
  forgotPasswordWorker,
  resetPasswordWorker,
  resendVerifyWorkerOtp,
  resendTaskProviderOtp
}; 