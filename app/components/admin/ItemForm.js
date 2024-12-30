// components/admin/ItemForm.js
'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { IoAdd } from 'react-icons/io5';

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
    
    // Expanded file type validation
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp', 
      'image/svg+xml',
      'image/bmp',
      'image/tiff'
    ];
  
    const maxSize = 10 * 1024 * 1024; // 10MB instead of 5MB
  
    // Soft validation with warning instead of hard rejection
    if (!allowedTypes.includes(file.type)) {
      const confirmUpload = window.confirm(
        `File type (${file.type}) is not typically used for images. Do you want to continue?`
      );
      
      if (!confirmUpload) {
        return;
      }
    }
  
    if (file.size > maxSize) {
      const confirmLargeFile = window.confirm(
        `The file is larger than 10MB. Large files may take longer to upload. Do you want to continue?`
      );
      
      if (!confirmLargeFile) {
        return;
      }
    }
  
    // Create a file reader to generate local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      // Set local preview
      setFormData(prev => ({
        ...prev,
        imagePreview: reader.result
      }));
    };
    reader.readAsDataURL(file);
  
    // Cloudinary Upload with More Robust Configuration
    try {
      // Cloudinary upload URL
      const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
  
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, 
        {
          method: 'POST',
          body: formData
        }
      );
  
      if (!response.ok) {
        // Detailed error handling
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
  
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        image: data.secure_url
      }));
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      setFormData(prev => ({
        ...prev,
        image: prev.imagePreview
      }));
    }
  };

  const handleAddonChange = (index, field, value) => {
    const newAddons = [...formData.addons];
    newAddons[index][field] = value;
    setFormData(prev => ({
      ...prev,
      addons: newAddons
    }));
  };

  // Add new addon
  const addAddon = () => {
    setFormData(prev => ({
      ...prev,
      addons: [...prev.addons, { name: '', price: '' }]
    }));
  };

  // Remove addon
  const removeAddon = (index) => {
    const newAddons = formData.addons.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      addons: newAddons
    }));
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.price || !formData.section) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Remove addons with empty name and price
    const cleanedAddons = formData.addons.filter(
      addon => addon.name.trim() !== '' && addon.price !== ''
    );

    // Prepare final form data
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      addons: cleanedAddons.length > 0 ? cleanedAddons : null
    };

    // Call parent submit handler
    onSubmit(submitData);
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
          className="mt-2 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
          Item Image
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleImageUpload}
          className="mt-2 p-2 block w-full"
        />
        {formData.image && (
          <div className="mt-2">
            <img
              src={formData.image}
              alt="Uploaded"
              className="h-32 w-32 object-cover rounded-md"
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
              min="0"// components/admin/ItemForm.js (continued)
              />
                <button
                  type="button"
                  onClick={() => removeAddon(index)}
                  className="text-red-500 hover:text-red-700 p-2 bg"
                >
                  Remove
                </button>
              </div>
            ))}
            
            {/* Add Addon Button */}
            <button
              type="button"
              onClick={addAddon}
              className="mt-2 text-blue-500 hover:text-blue-700 flex items-center"
            >
              <IoAdd className="mr-1" /> Add Addon
            </button>
          </div>
    
          {/* Submit Button */}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              {initialData ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      );
    }