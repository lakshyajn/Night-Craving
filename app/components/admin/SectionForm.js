'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';

export default function SectionForm({ onSubmit, existingSections = [] }) {
  const [sectionName, setSectionName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = sectionName.trim();

    if (existingSections.some(section =>
      section.name.toLowerCase() === trimmedName.toLowerCase()
    )) {
      toast.error('Section already exists');
      return;
    }

    if (!trimmedName) {
      toast.error('Section name cannot be empty');
      return;
    }

    try {
      await onSubmit({ name: trimmedName });
      setSectionName('');
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 w-full"
    >
      <input
        type="text"
        value={sectionName}
        onChange={(e) => setSectionName(e.target.value)}
        placeholder="Enter new section name"
        className="flex-grow px-3 py-2 border rounded-md w-full"
      />
      <Button
        type="submit" 
        className="text-white px-4 py-2 rounded-md hover:bg-green-600 w-full sm:w-auto"
      >
        Add Section
      </Button>
    </form>
  );
}