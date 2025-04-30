// lib/crypto.js
const crypto = require('crypto');

// AES-256 requires a 32-byte key (256 bits)
const SECRET_KEY = "294cf7042878cbed0b2ada69c20150dfd0564b2fff74470b16ec5b85d1401dbe";
console.log("SECRET_KEY",SECRET_KEY);
const IV_LENGTH = 16; // For AES, this is always 16

function encryptPayload(payload) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    console.log("SECRET_KEY",SECRET_KEY);
    // Create a 32-byte key by using a hash if needed
    const key = crypto.createHash('sha256').update(String(SECRET_KEY)).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(JSON.stringify(payload));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error.message);
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

function decryptPayload(text) {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    // Create a 32-byte key by using a hash if needed
    const key = crypto.createHash('sha256').update(String(SECRET_KEY)).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

module.exports = { encryptPayload, decryptPayload };