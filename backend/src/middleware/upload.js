const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Upload directory created:', uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create subdirectories based on file type for better organization
    let subDir = 'others';
    
    if (file.mimetype.startsWith('image/')) {
      subDir = 'images';
    } else if (file.mimetype.startsWith('video/')) {
      subDir = 'videos';
    } else if (file.mimetype === 'application/pdf') {
      subDir = 'documents';
    }
    
    const targetDir = path.join(uploadDir, subDir);
    
    // Create subdirectory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    cb(null, targetDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
    
    cb(null, fileName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Configure multer with options
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 3 // Maximum 3 files per request
  }
});

// Middleware to handle single file upload
const uploadSingle = (fieldName = 'file') => {
  return (req, res, next) => {
    const uploadHandler = upload.single(fieldName);
    
    uploadHandler(req, res, (error) => {
      if (error) {
        console.error('File upload error:', error.message);
        
        if (error instanceof multer.MulterError) {
          if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 5MB.'
            });
          }
          if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: 'Too many files. Maximum is 3 files.'
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      // Add file metadata to request if file was uploaded
      if (req.file) {
        req.fileMetadata = {
          fileName: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          filePath: req.file.path
        };
        
        console.log('📎 File uploaded successfully:', {
          originalName: req.file.originalname,
          size: `${(req.file.size / 1024).toFixed(2)} KB`,
          type: req.file.mimetype
        });
      }
      
      next();
    });
  };
};

// Middleware to handle multiple files upload
const uploadMultiple = (fieldName = 'files', maxCount = 3) => {
  return (req, res, next) => {
    const uploadHandler = upload.array(fieldName, maxCount);
    
    uploadHandler(req, res, (error) => {
      if (error) {
        console.error('Multiple files upload error:', error.message);
        
        if (error instanceof multer.MulterError) {
          if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'One or more files are too large. Maximum size is 5MB per file.'
            });
          }
          if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: `Too many files. Maximum is ${maxCount} files.`
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      // Add files metadata to request
      if (req.files && req.files.length > 0) {
        req.filesMetadata = req.files.map(file => ({
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          filePath: file.path
        }));
        
        console.log(`📎 ${req.files.length} file(s) uploaded successfully`);
      }
      
      next();
    });
  };
};

// Utility function to delete uploaded file (cleanup)
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (error) => {
      if (error && error.code !== 'ENOENT') {
        console.error('Error deleting file:', error);
        reject(error);
      } else {
        console.log('🗑️ File deleted:', filePath);
        resolve();
      }
    });
  });
};

// Middleware to clean up files on error
const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // If response is an error and files were uploaded, clean them up
    if (res.statusCode >= 400) {
      const filesToDelete = [];
      
      if (req.file) {
        filesToDelete.push(req.file.path);
      }
      
      if (req.files) {
        filesToDelete.push(...req.files.map(file => file.path));
      }
      
      // Delete files asynchronously (don't wait for completion)
      filesToDelete.forEach(filePath => {
        deleteFile(filePath).catch(err => {
          console.error('Cleanup error:', err);
        });
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteFile,
  cleanupOnError
};