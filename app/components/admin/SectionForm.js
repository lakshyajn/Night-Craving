'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';

export default function SectionForm({ onSubmit, existingSections = [] }) {
  const [sectionName, setSectionName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Trim and validate section name
    const trimmedName = sectionName.trim();
    
    // Check if section already exists
    if (existingSections.some(section => 
      section.name.toLowerCase() === trimmedName.toLowerCase()
    )) {
      toast.error('Section already exists');
      return;
    }

    // Validate section name
    if (!trimmedName) {
      toast.error('Section name cannot be empty');
      return;
    }

    try {
      await onSubmit({ name: trimmedName });
      setSectionName(''); // Clear input after successful submission
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        value={sectionName}
        onChange={(e) => setSectionName(e.target.value)}
        placeholder="Enter new section name"
        className="flex-grow px-3 py-2 border rounded-md"
      />
      <Button
        type="submit" 
        className="text-white px-4 py-2 rounded-md hover:bg-green-600"
      >
        Add Section
      </Button>
    </form>
  );
}