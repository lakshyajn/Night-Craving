'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { IoAdd, IoCheckmarkCircle } from 'react-icons/io5';

// Utility to generate a unique id for addons
const uniqueId = () => Math.random().toString(36).substr(2, 9);

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
    imagePreview: null,
    inStock: true,
    addons: [{ id: uniqueId(), name: '', price: '' }]
  });

  // Toast helpers
  const showSuccessToast = (message) => {
    toast.success(message, {
      style: { background: '#37EE00', color: '#fff', borderRadius: '8px', fontWeight: 500 },
    });
  };
  const showErrorToast = (message) => {
    toast.error(message, {
      style: { background: '#EF4444', color: '#fff', borderRadius: '8px', fontWeight: 500 },
    });
  };

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        addons: initialData.addons?.map(a => ({ ...a, id: uniqueId() })) || [{ id: uniqueId(), name: '', price: '' }],
        imagePreview: initialData.image || null,
      });
    }
  }, [initialData]);

  // General input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imagePreview: reader.result }));
    };
    reader.readAsDataURL(file);

    const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      showErrorToast('No Cloudinary credentials found, using local preview only.');
      return;
    }

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: uploadFormData }
      );

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFormData(prev => ({ ...prev, image: data.secure_url }));
      showSuccessToast('📸 Image uploaded successfully!');
    } catch (err) {
      showErrorToast('Failed to upload image.');
    }
  };

  // Addons
  const handleAddonChange = (i, field, value) => {
    const newAddons = [...formData.addons];
    newAddons[i][field] = value;
    setFormData(prev => ({ ...prev, addons: newAddons }));
  };

  const addAddon = () =>
    setFormData(prev => ({ ...prev, addons: [...prev.addons, { id: uniqueId(), name: '', price: '' }] }));

  const removeAddon = (i) =>
    setFormData(prev => ({ ...prev, addons: prev.addons.filter((_, idx) => idx !== i) }));

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.section) {
      showErrorToast('Please fill all required fields');
      return;
    }

    const cleanedAddons = formData.addons.filter(a => a.name && a.price);
    const { imagePreview, ...dataToSubmit } = formData;

    try {
      await onSubmit({
        ...dataToSubmit,
        price: parseFloat(dataToSubmit.price),
        addons: cleanedAddons.length > 0 ? cleanedAddons : null,
      });

      showSuccessToast(initialData ? '✅ Item updated!' : '🎉 Item added!');
    } catch (err) {
      showErrorToast(err.message || '❌ Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl mx-auto">
      {/* Section */}
      <div>
        <label className="block font-semibold">Section</label>
        <select
          name="section"
          value={formData.section}
          onChange={handleChange}
          className="mt-2 w-full rounded-md border px-3 py-2"
          required
        >
          <option value="">Select a Section</option>
          {sections.map(s => (
            <option key={s._id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Name + Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold">Item Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-2 w-full rounded-md border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="mt-2 w-full rounded-md border px-3 py-2"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block font-semibold">Item Image (Optional)</label>
        <input type="file" onChange={handleImageUpload} className="mt-2 w-full" />
        {(formData.imagePreview || formData.image) && (
          <div className="mt-3">
            <img
              src={formData.imagePreview || formData.image}
              alt="Preview"
              className="h-40 w-40 object-cover rounded-md border mx-auto sm:mx-0"
            />
          </div>
        )}
      </div>

      {/* In Stock */}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.inStock}
          onChange={(e) => setFormData(p => ({ ...p, inStock: e.target.checked }))}
          className="mr-2"
        />
        <span className="font-semibold">In Stock</span>
      </div>

      {/* Addons */}
      <div>
        <label className="block font-semibold">Addons (Optional)</label>
        <div className="space-y-2">
          {formData.addons.map((addon, i) => (
            <div key={addon.id} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Addon Name"
                value={addon.name}
                onChange={(e) => handleAddonChange(i, 'name', e.target.value)}
                className="flex-1 rounded-md border px-3 py-2"
              />
              <input
                type="number"
                placeholder="Addon Price"
                value={addon.price}
                onChange={(e) => handleAddonChange(i, 'price', e.target.value)}
                className="w-full sm:w-28 rounded-md border px-3 py-2"
                min="0"
                step="0.01"
              />
              <button
                type="button"
                onClick={() => removeAddon(i)}
                className="text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addAddon}
          className="mt-3 flex items-center text-green-600 hover:underline"
        >
          <IoAdd className="mr-1" /> Add Addon
        </button>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium"
        >
          <IoCheckmarkCircle /> {initialData ? 'Update Item' : 'Add Item'}
        </button>
      </div>
    </form>
  );
}