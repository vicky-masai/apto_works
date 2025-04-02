const jwt = require('jsonwebtoken');
const config = require('../config/config');
const prisma = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Check if user exists in either TaskProvider or Worker
    const taskProvider = await prisma.taskProvider.findUnique({
      where: { id: decoded.userId }
    });

    const worker = await prisma.worker.findUnique({
      where: { id: decoded.userId }
    });

    if (!taskProvider && !worker) {
      throw new Error();
    }

    req.user = taskProvider || worker;
    req.userType = taskProvider ? 'taskProvider' : 'worker';
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

const taskProviderAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    const taskProvider = await prisma.taskProvider.findUnique({
      where: { id: decoded.userId }
    });

    if (!taskProvider) {
      throw new Error();
    }

    req.user = taskProvider;
    req.userType = 'taskProvider';
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate as a task provider.' });
  }
};

const workerAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    const worker = await prisma.worker.findUnique({
      where: { id: decoded.userId }
    });

    if (!worker) {
      throw new Error();
    }

    req.user = worker;
    req.userType = 'worker';
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate as a worker.' });
  }
};

module.exports = {
  auth,
  taskProviderAuth,
  workerAuth
}; 