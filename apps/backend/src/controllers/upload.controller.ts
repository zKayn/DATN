import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Verify Cloudinary config
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary configuration missing!');
  console.error('CLOUDINARY_CLOUD_NAME:', cloudName);
  console.error('CLOUDINARY_API_KEY:', apiKey ? '***' : 'undefined');
  console.error('CLOUDINARY_API_SECRET:', apiSecret ? '***' : 'undefined');
}

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

console.log('✅ Cloudinary configured:', cloudName);

// Cấu hình multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh'));
    }
  }
});

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn ảnh'
        });
      }

      try {
        // Upload lên Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'sports-store',
              transformation: [
                { width: 1000, height: 1000, crop: 'limit' },
                { quality: 'auto' }
              ]
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          uploadStream.end(req.file!.buffer);
        });

        res.json({
          success: true,
          message: 'Upload ảnh thành công',
          data: {
            url: (result as any).secure_url,
            publicId: (result as any).public_id
          }
        });
      } catch (uploadError: any) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: uploadError.message || 'Lỗi khi upload ảnh lên Cloudinary'
        });
      }
    });
  } catch (error: any) {
    console.error('Controller error:', error);
    next(error);
  }
};

export const uploadMultipleImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    upload.array('images', 10)(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn ảnh'
        });
      }

      try {
        console.log(`Uploading ${files.length} images to Cloudinary...`);

        const uploadPromises = files.map((file, index) => {
          return new Promise((resolve, reject) => {
            console.log(`Uploading image ${index + 1}/${files.length}: ${file.originalname}`);
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'sports-store',
                transformation: [
                  { width: 1000, height: 1000, crop: 'limit' },
                  { quality: 'auto' }
                ]
              },
              (error, result) => {
                if (error) {
                  console.error(`Upload error for ${file.originalname}:`, error);
                  reject(error);
                } else {
                  console.log(`✅ Uploaded ${file.originalname}`);
                  resolve(result);
                }
              }
            );

            uploadStream.end(file.buffer);
          });
        });

        const results = await Promise.all(uploadPromises);

        const urls = results.map((result: any) => ({
          url: result.secure_url,
          publicId: result.public_id
        }));

        console.log(`✅ Successfully uploaded ${urls.length} images`);

        res.json({
          success: true,
          message: 'Upload ảnh thành công',
          data: urls
        });
      } catch (uploadError: any) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: uploadError.message || 'Lỗi khi upload ảnh lên Cloudinary'
        });
      }
    });
  } catch (error: any) {
    console.error('Controller error:', error);
    next(error);
  }
};
