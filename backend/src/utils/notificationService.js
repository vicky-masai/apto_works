// utils/socketNotifier.js
const prisma = require('../config/database');
const dayjs = require('dayjs');

let ioInstance = null;
const onlineUsers = new Map();

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

const sendNotification = async ({ receiverId, heading, message, senderId = 'System' }) => {
  try {
    const expiresAt = dayjs().add(5, 'day').toDate(); // 5 days later

    const notification = await prisma.notification.create({
      data: {
        receiverId,
        senderId,
        heading,
        message,
        expiresAt,
      },
    });

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
