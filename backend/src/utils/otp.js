const generateOTP = () => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateResetToken = () => {
  // Generate a random token for password reset
  return require('crypto').randomBytes(32).toString('hex');
};

module.exports = {
  generateOTP,
  generateResetToken,
}; 