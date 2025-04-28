// lib/crypto.js
const crypto = require('crypto');

// AES-256 requires a 32-byte key (256 bits)
const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;
const IV_LENGTH = 16; // For AES, this is always 16

function encryptPayload(payload) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
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