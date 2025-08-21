import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  LinearProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  AttachFile,
  Delete,
  InsertDriveFile,
  Image,
  PictureAsPdf,
  Description,
} from '@mui/icons-material';

// File type icons mapping
const getFileIcon = (mimeType) => {
  if (mimeType.startsWith('image/')) return <Image color="primary" />;
  if (mimeType === 'application/pdf') return <PictureAsPdf color="error" />;
  if (mimeType.includes('document') || mimeType.includes('word')) return <Description color="info" />;
  return <InsertDriveFile color="action" />;
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validate file type and size
const validateFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
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

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not supported. Please use images, PDFs, or documents.`
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds the 5MB limit.`
    };
  }

  return { isValid: true };
};

function FileUploader({ onFileSelect, selectedFile, disabled = false }) {
  const [uploadError, setUploadError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      const errorMessage = rejection.errors.map(e => e.message).join(', ');
      setUploadError(errorMessage);
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    // Validate the file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error);
      return;
    }

    // Clear any previous errors
    setUploadError(null);
    
    // Simulate upload progress (in a real app, this would be actual upload progress)
    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          
          // Simulate final processing time
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(100);
            onFileSelect(file);
          }, 500);
          
          return 90;
        }
        return prev + Math.random() * 30;
      });
    }, 200);

  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: disabled || isUploading,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  });

  const removeFile = () => {
    onFileSelect(null);
    setUploadError(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  return (
    <Box>
      {/* Upload Area */}
      {!selectedFile && (
        <Paper
          {...getRootProps()}
          sx={{
            border: 2,
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderStyle: 'dashed',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: isDragActive ? 'action.hover' : 'transparent',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.6 : 1,
            '&:hover': {
              borderColor: disabled ? 'grey.300' : 'primary.main',
              backgroundColor: disabled ? 'transparent' : 'action.hover',
            }
          }}
        >
          <input {...getInputProps()} />
          
          <CloudUpload 
            sx={{ 
              fontSize: 48, 
              color: isDragActive ? 'primary.main' : 'grey.500',
              mb: 2 
            }} 
          />
          
          <Typography variant="h6" color="textPrimary" gutterBottom>
            {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
          </Typography>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            or click to browse files
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Chip label="Images" size="small" variant="outlined" />
            <Chip label="PDFs" size="small" variant="outlined" />
            <Chip label="Documents" size="small" variant="outlined" />
          </Box>
          
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Maximum file size: 5MB
          </Typography>
        </Paper>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Uploading file... {Math.round(uploadProgress)}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
            sx={{ borderRadius: 1 }}
          />
        </Box>
      )}

      {/* Selected File Display */}
      {selectedFile && !isUploading && (
        <Paper
          sx={{
            p: 2,
            mt: 2,
            border: 1,
            borderColor: 'success.main',
            backgroundColor: 'success.50',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getFileIcon(selectedFile.type)}
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </Typography>
              </Box>
            </Box>
            
            <IconButton
              onClick={removeFile}
              size="small"
              color="error"
              title="Remove file"
            >
              <Delete />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Error Display */}
      {uploadError && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}

      {/* Helper Text */}
      {!selectedFile && !uploadError && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          <AttachFile sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
          Supported formats: JPEG, PNG, GIF, WebP, PDF, TXT, DOC, DOCX, XLS, XLSX
        </Typography>
      )}
    </Box>
  );
}

export default FileUploader;