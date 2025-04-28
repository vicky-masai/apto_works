// lib/crypto.js
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('NEXT_PUBLIC_SECRET_KEY is not set in environment variables');
}

export function encryptPayload(payload) {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(payload), SECRET_KEY).toString();
  return ciphertext;
}

export function decryptPayload(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
}