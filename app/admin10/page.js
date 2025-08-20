// app/admin10/page.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ItemForm from '../components/admin/ItemForm';
import SectionForm from '../components/admin/SectionForm';
import SectionScroll from '../components/admin/SectionScroll';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { IoAdd, IoTrash, IoPencil } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useSync } from '../contexts/SyncContext';

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [sections, setSections] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { triggerSync = () => {} } = useSync() || {};
  const [error, setError] = useState(null);

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

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [sectionsRes, itemsRes] = await Promise.all([
        fetch('/api/sections'),
        fetch('/api/items')
      ]);

      // Helper function to parse responses
      const parseResponse = async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }
        return response.json();
      };

      const [sectionsData, itemsData] = await Promise.all([
        parseResponse(sectionsRes),
        parseResponse(itemsRes)
      ]);

      setSections(sectionsData.sections || []);
      setItems(itemsData.items || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
      setError(err.message);
      showErrorToast('Failed to load sections and items');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddSection = async (sectionData) => {
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData)
      });
      
      if (!response.ok) throw new Error('Failed to add section');
      
      showSuccessToast(`🎉 Section "${sectionData.name}" added successfully!`);
      fetchData();
    } catch (error) {
      console.error('Error adding section:', error);
      showErrorToast(error.message || 'Failed to add section');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    // Confirm deletion
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this section? All associated items will also be removed.'
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete section');
      }

      // Remove section locally
      setSections(prevSections => 
        prevSections.filter(section => section._id !== sectionId)
      );

      // Remove associated items
      setItems(prevItems => 
        prevItems.filter(item => item.sectionId !== sectionId)
      );

      triggerSync();

      showSuccessToast('🗑️ Section deleted successfully');
    } catch (error) {
      console.error('Delete section error:', error);
      showErrorToast('Failed to delete section');
    }
  };

  // Validation helpers
  const validateSection = (sectionData) => {
    if (!sectionData.name || sectionData.name.trim() === '') {
      showErrorToast('Section name cannot be empty');
      return false;
    }
    return true;
  };

  const validateItem = (itemData) => {
    const requiredFields = ['name', 'price', 'section', 'image'];
    const missingFields = requiredFields.filter(field => {
      // Check if the field exists and is not empty
      if (field === 'price') {
        // Special handling for numeric fields
        return itemData[field] === undefined || itemData[field] === null || itemData[field] === '';
      }
      
      // For string fields
      return !itemData[field] || 
             (typeof itemData[field] === 'string' && itemData[field].trim() === '');
    });

    if (missingFields.length > 0) {
      showErrorToast(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (parseFloat(itemData.price) <= 0) {
      showErrorToast('Price must be a positive number');
      return false;
    }

    return true;
  };

  const handleAddItem = async (itemData) => {
    if (!validateItem(itemData)) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      
      if (!response.ok) throw new Error('Failed to add item');
      
      showSuccessToast(`🎉 "${itemData.name}" added successfully!`);
      setShowItemForm(false);
      fetchData();
    } catch (error) {
      console.error('Error adding item:', error);
      showErrorToast(error.message || 'Failed to add item');
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk Delete Functionality
  const handleBulkDelete = useCallback(async (sectionId, sectionName) => {
    if (isLoading) return;

    if (!confirm(`Are you sure you want to delete all items in ${sectionName} and the section itself?`)) return;

    try {
      setIsLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      // Parse response with error handling
      const responseData = await response.json();

      if (responseData.status === 'error') {
        throw new Error(responseData.message || 'Unknown error occurred');
      }

      // Remove section and its items locally
      setSections(prevSections => 
        prevSections.filter(section => section._id !== sectionId)
      );

      setItems(prevItems => 
        prevItems.filter(item => item.sectionId !== sectionId)
      );

      // Trigger sync
      triggerSync();

      // Success toast
      showSuccessToast(
        `🗑️ Deleted section ${sectionName} and ${responseData.data.itemsDeletedCount} associated items`
      );
    } catch (error) {
      console.error('Error deleting section:', error);
      
      if (error.name === 'AbortError') {
        showErrorToast('Deletion timed out. Please try again.');
      } else {
        showErrorToast(
          error.message || 
          'Failed to delete section. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [triggerSync, isLoading]);

  // Render with Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2" style={{ borderTopColor: '#37EE00' }}></div>
      </div>
    );
  }

  const handleUpdateItem = async (itemData) => {
    try {
      const response = await fetch(`/api/items/${editingItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      
      if (!response.ok) throw new Error('Failed to update item');
      
      showSuccessToast(`✅ "${itemData.name}" updated successfully!`);
      setShowItemForm(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error updating item:', error);
      showErrorToast('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Remove item locally
      setItems(prevItems => 
        prevItems.filter(item => item._id !== itemId)
      );

      triggerSync();

      showSuccessToast('🗑️ Item deleted successfully');
    } catch (error) {
      console.error('Delete item error:', error);
      showErrorToast('Failed to delete item');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8" suppressHydrationWarning={true}>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Section</h2>
        <SectionForm onSubmit={handleAddSection} />
      </div>
      
      {/* Section Management */}
      <div className="mb-8">
        {/* Horizontal Scroll of Sections */}
        {sections.length > 0 && (
          <SectionScroll 
            sections={sections} 
            onBulkDelete={handleBulkDelete}
          />
        )}
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Menu Items</h2>
          <Button onClick={() => setShowItemForm(true)}>
            <IoAdd className="mr-2" /> Add New Item
          </Button>
        </div>

        <div className="space-y-4">
          {sections.map((section) => {
            const sectionItems = items.filter(item => item.section === section.name);
            if (sectionItems.length === 0) return null;

            return (
              <motion.div
                key={section.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4"
              >
                <h3 className="text-lg font-medium mb-4">{section.name}</h3>
                <div className="space-y-4">
                  {sectionItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">₹{item.price}</p>
                          <div className="flex items-center mt-1">
                            <input
                              type="checkbox"
                              checked={item.inStock}
                              onChange={async () => {
                                try {
                                  const response = await fetch(`/api/items/${item._id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ inStock: !item.inStock })
                                  });
                                  if (!response.ok) throw new Error('Failed to update stock status');
                                  showSuccessToast(`📦 Stock status updated for "${item.name}"`);
                                  fetchData();
                                } catch (error) {
                                  showErrorToast('Failed to update stock status');
                                }
                              }}
                              className="mr-2 text-gray-700"
                              style={{
                                accentColor: '#37EE00'
                              }}
                              onFocus={(e) => {
                                e.target.style.outline = `2px solid rgba(55, 238, 0, 0.3)`;
                              }}
                              onBlur={(e) => {
                                e.target.style.outline = '';
                              }}
                            />
                            <span className="text-sm text-gray-600">In Stock</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            setShowItemForm(true);
                          }}
                        >
                          <IoPencil />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteItem(item._id)}
                        >
                          <IoTrash />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={showItemForm}
        onClose={() => {
          setShowItemForm(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
      >
        <ItemForm
          initialData={editingItem}
          onSubmit={editingItem ? handleUpdateItem : handleAddItem}
          sections={sections}
        />
      </Modal>
    </div>
  );
}