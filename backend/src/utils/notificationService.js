const prisma = require('../config/database');
const dayjs = require('dayjs');
const nodemailer = require('nodemailer'); // assuming nodemailer for email

let ioInstance = null;
const onlineUsers = new Map();

// 1. Setup mail transporter (customize as needed)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // from .env
    pass: process.env.EMAIL_PASSWORD,
  },
});

// 2. Send email
const sendEmailNotification = async (to, heading, message) => {
  try {
    await transporter.sendMail({
      from: `"Sabsamadhan" <${process.env.EMAIL_USER}>`,
      to,
      subject: heading,
      text: message,
    });
  } catch (error) {
    console.error('Email send error:', error.message);
  }
};

const setSocketIO = (io) => {
  ioInstance = io;
};

const addOnlineUser = (userId, socketId) => {
  onlineUsers.set(userId.toString(), socketId);
};

const removeOnlineUser = (socketId) => {
  for (let [userId, id] of onlineUsers.entries()) {
    if (id === socketId) {
      onlineUsers.delete(userId);
      break;
    }
  }
};

// Main function to send socket + DB + optional mail notification
const sendNotification = async ({
  receiverId,
  heading,
  message,
  senderId = 'System',
  sendMail = false,
  email = '',
}) => {
  try {
    const expiresAt = dayjs().add(5, 'day').toDate();

    const notification = await prisma.notification.create({
      data: {
        receiverId,
        senderId,
        heading,
        message,
        expiresAt,
      },
    });

    // Send via socket if online
    const socketId = onlineUsers.get(receiverId.toString());
    if (socketId && ioInstance) {
      ioInstance.to(socketId).emit("getNotification", {
        id: notification.id,
        senderId,
        heading,
        message,
        timestamp: notification.timestamp,
        expiresAt,
      });
    }

    // Optional email send
    if (sendMail && email) {
      await sendEmailNotification(email, heading, message);
    }
  } catch (error) {
    console.error('Error sending notification:', error.message);
  }
};

module.exports = {
  setSocketIO,
  addOnlineUser,
  removeOnlineUser,
  sendNotification,
};
