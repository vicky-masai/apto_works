const { put, del } = require('@vercel/blob');

class BlobService {
  async uploadBase64File(base64String, fileName) {
    try {
      if (!base64String || !fileName) {
        throw new Error('Base64 string and filename are required');
      }

      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const blob = await put(fileName, buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return blob.url;
    } catch (error) {
      console.error('Blob Upload Error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(fileUrl) {
    try {
      if (!fileUrl) {
        throw new Error('File URL is required for deletion');
      }

      const urlParts = new URL(fileUrl);
      const pathname = urlParts.pathname.slice(1); // Remove leading '/'

      const result = await del(pathname, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      console.log('File deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('Blob Delete Error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}

module.exports = new BlobService();