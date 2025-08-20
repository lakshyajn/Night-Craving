// components/admin/ItemForm.js
'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { IoAdd, IoCheckmarkCircle } from 'react-icons/io5';

export default function ItemForm({ 
  initialData = null, 
  onSubmit, 
  sections = [] 
}) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    section: '',
    image: null,
    inStock: true,
    addons: [{ name: '', price: '' }]
  });

  // Custom toast styles with bright green theme
  const showSuccessToast = (message) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#37EE00', // Bright Green
        color: '#ffffff',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(55, 238, 0, 0.3), 0 4px 6px -2px rgba(55, 238, 0, 0.2)',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#37EE00',
      },
    });
  };

  const showErrorToast = (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#EF4444', // Red-500
        color: '#ffffff',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(239, 68, 68, 0.2)',
      },
    });
  };

  // Populate form with initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        addons: initialData.addons || [{ name: '', price: '' }]
      });
    }
  }, [initialData]);

  // Handle general input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
      'image/svg+xml', 'image/bmp', 'image/tiff'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      if (!window.confirm(`File type (${file.type}) is not standard. Continue?`)) return;
    }
    if (file.size > maxSize) {
      if (!window.confirm(`File is >10MB. This may be slow. Continue?`)) return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imagePreview: reader.result }));
    };
    reader.readAsDataURL(file);

    try {
      const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      uploadFormData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, 
        { method: 'POST', body: uploadFormData }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, image: data.secure_url }));
      showSuccessToast('📸 Image uploaded successfully!');
    } catch (error) {
      setFormData(prev => ({ ...prev, image: prev.imagePreview }));
      showErrorToast('Failed to upload image. Please try again.');
    }
  };

  const handleAddonChange = (index, field, value) => {
    const newAddons = [...formData.addons];
    newAddons[index][field] = value;
    setFormData(prev => ({ ...prev, addons: newAddons }));
  };

  const addAddon = () => {
    setFormData(prev => ({ ...prev, addons: [...prev.addons, { name: '', price: '' }] }));
  };

  const removeAddon = (index) => {
    const newAddons = formData.addons.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, addons: newAddons }));
  };

  // CORRECTED SUBMISSION HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.section) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    const cleanedAddons = formData.addons.filter(
      addon => addon.name.trim() !== '' && addon.price !== ''
    );

    // THE FIX: Destructure to remove the frontend-only 'imagePreview' property.
    const { imagePreview, ...dataToSubmit } = formData;

    const finalSubmitData = {
      ...dataToSubmit,
      price: parseFloat(dataToSubmit.price),
      addons: cleanedAddons.length > 0 ? cleanedAddons : null
    };

    try {
      await onSubmit(finalSubmitData);
      const successMessage = initialData 
        ? '✅ Item updated successfully!' 
        : '🎉 Item added successfully!';
      showSuccessToast(successMessage);
    } catch (error) {
      const errorMessage = initialData
        ? '❌ Failed to update item.'
        : '❌ Failed to add item.';
      showErrorToast(error.message || errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Section Dropdown */}
      <div>
        <label className="block text-l font-bold text-gray-900">
          Section
        </label>
        <select
          name="section"
          value={formData.section}
          onChange={handleChange}
          className="mt-2 p-2 block w-full rounded-md border-gray-300 shadow-sm"
          required
        >
          <option value="">Select a Section</option>
          {sections.map((section) => (
            <option 
              key={section._id || section.name} 
              value={section.name}
            >
              {section.name}
            </option>
          ))}
        </select>
      </div>

      {/* Name Input */}
      <div>
        <label className="block text-l font-bold text-gray-900">
          Item Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-2 p-2 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      {/* Price Input */}
      <div>
        <label className="block text-l font-bold text-gray-900">
          Price
        </label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="mt-2 p-2 block w-full rounded-md border-gray-300 shadow-sm"
          min="0"
          step="0.01"
          required
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-l font-bold text-gray-900">
          Item Image (Optional)
        </label>
        <input
          type="file"
          onChange={handleImageUpload}
          className="mt-2 p-2 block w-full rounded-md"
        />
        {(formData.imagePreview || formData.image) && (
          <div className="mt-2">
            <img
              src={formData.imagePreview || formData.image}
              alt="Item Preview"
              className="h-32 w-32 object-cover rounded-md border-2"
              style={{ borderColor: '#37EE00' }}
            />
          </div>
        )}
      </div>

      {/* In Stock Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          name="inStock"
          checked={formData.inStock}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            inStock: e.target.checked
          }))}
          className="mr-2"
          style={{ accentColor: '#37EE00' }}
        />
        <label className="text-md font-bold text-gray-900">
          In Stock
        </label>
      </div>

      {/* Addons Section */}
      <div>
        <label className="block text-l font-bold text-gray-900">
          Addons (Optional)
        </label>
        {formData.addons.map((addon, index) => (
          <div key={index} className="flex space-x-2 mt-2 p-2">
            <input
              type="text"
              placeholder="Addon Name"
              value={addon.name}
              onChange={(e) => handleAddonChange(index, 'name', e.target.value)}
              className="flex-grow rounded-md border-gray-300 shadow-sm p-2"
            />
            <input
              type="number"
              placeholder="Addon Price"
              value={addon.price}
              onChange={(e) => handleAddonChange(index, 'price', e.target.value)}
              className="w-24 rounded-md border-gray-300 shadow-sm p-2"
              min="0"
              step="0.01"
            />
            <button
              type="button"
              onClick={() => removeAddon(index)}
              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-md transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addAddon}
          className="mt-2 flex items-center hover:bg-opacity-10 p-2 rounded-md transition-colors"
          style={{ color: '#37EE00' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(55, 238, 0, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
        >
          <IoAdd className="mr-1" /> Add Addon
        </button>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="text-white px-6 py-2 rounded-md transition-transform duration-200 font-medium shadow-sm flex items-center space-x-2"
          style={{ backgroundColor: '#37EE00' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2BC800';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#37EE00';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <IoCheckmarkCircle className="w-4 h-4" />
          <span>{initialData ? 'Update Item' : 'Add Item'}</span>
        </button>
      </div>
    </form>
  );
}