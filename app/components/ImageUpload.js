'use client';
import { useState } from 'react';
import styles from './ImageUpload.module.css';

export default function ImageUpload({ onImageUpload }) {
  const [previewImage, setPreviewImage] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'your_cloudinary_upload_preset'); // Cloudinary upload preset

      try {
        // Upload to Cloudinary
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/your_cloudinary_cloud_name/image/upload`, 
          {
            method: 'POST',
            body: formData
          }
        );

        const data = await response.json();
        
        // Set preview and call parent component
        setPreviewImage(data.secure_url);
        onImageUpload(data.secure_url);
      } catch (error) {
        console.error('Image upload error:', error);
        // Handle upload error
      }
    }
  };

  return (
    <div className={styles.imageUploadContainer}>
      <input 
        type="file" 
        accept="image/*"
        onChange={handleFileChange}
        className={styles.fileInput}
        id="imageUpload"
      />
      <label htmlFor="imageUpload" className={styles.uploadLabel}>
        {previewImage ? (
          <img 
            src={previewImage} 
            alt="Preview" 
            className={styles.previewImage} 
          />
        ) : (
          'Upload Image'
        )}
      </label>
    </div>
  );
}