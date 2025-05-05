const express = require('express');
const { put } = require('@vercel/blob');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;

    // Upload to Vercel Blob
    const blob = await put(file.name, file.data, {
      access: 'public', // or 'private' if you want
      contentType: file.mimetype,
    });

    res.json({ url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

module.exports = router;