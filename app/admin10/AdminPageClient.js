'use client';
import { useState } from "react";
import { motion } from "framer-motion";
import ItemForm from "../components/admin/ItemForm";
import SectionForm from "../components/admin/SectionForm";
import SectionScroll from "../components/admin/SectionScroll";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { IoAdd, IoTrash, IoPencil } from "react-icons/io5";
import toast from "react-hot-toast";

export default function AdminPageClient({ initialSections, initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [sections, setSections] = useState(initialSections);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ✅ Toast helpers
  const showSuccessToast = (msg) => toast.success(msg, { position: "top-right" });
  const showErrorToast = (msg) => toast.error(msg, { position: "top-right" });

  // ✅ SECTION OPERATIONS
  const handleAddSection = async (sectionData) => {
    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectionData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to add section");
        return;
      }

      const data = await res.json();
      // ✅ update state so ItemForm dropdown also sees it
      setSections((prev) => [...prev, data.section]);
    } catch (error) {
      console.error("Error adding section:", error);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm("Delete this section and all its items?")) return;
    try {
      await fetch(`/api/sections/${sectionId}`, { method: "DELETE" });
      setSections((prev) => prev.filter((s) => s._id !== sectionId));
      setItems((prev) => prev.filter((i) => i.sectionId !== sectionId));
      showSuccessToast("🗑️ Section deleted");
    } catch {
      showErrorToast("Failed to delete section");
    }
  };

  // ✅ ITEM OPERATIONS
  const handleAddItem = async (itemData) => {
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });
      if (!res.ok) throw new Error("Failed to add item");
      const newItem = await res.json();
      setItems((prev) => [...prev, newItem]);
      setShowItemForm(false);
      showSuccessToast(`🎉 Item "${newItem.name}" added`);
    } catch (err) {
      showErrorToast(err.message);
    }
  };

  const handleUpdateItem = async (itemData) => {
    try {
      const res = await fetch(`/api/items/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });
      if (!res.ok) throw new Error("Failed to update item");
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
      setEditingItem(null);
      setShowItemForm(false);
      showSuccessToast(`✅ Item "${updated.name}" updated`);
    } catch (err) {
      showErrorToast(err.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm("Delete this item?")) return;
    try {
      setDeletingId(itemId);
      await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i._id !== itemId));
      showSuccessToast("🗑️ Item deleted");
    } catch {
      showErrorToast("Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleStock = async (item) => {
    try {
      const res = await fetch(`/api/items/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: !item.inStock }),
      });
      if (!res.ok) throw new Error("Failed to update stock");
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, inStock: !i.inStock } : i))
      );
      showSuccessToast(`📦 Stock updated for "${item.name}"`);
    } catch {
      showErrorToast("Failed to update stock");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Add Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Section</h2>
        <SectionForm onSubmit={handleAddSection} />
      </div>

      {/* Section Scroll */}
      {sections.length > 0 && (
        <div className="mb-8">
          <SectionScroll sections={sections} onBulkDelete={handleDeleteSection} />
        </div>
      )}

      {/* Items */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Menu Items</h2>
          <Button onClick={() => setShowItemForm(true)}>
            <IoAdd className="mr-2" /> Add New Item
          </Button>
        </div>

        <div className="space-y-4">
          {sections.map((section) => {
            const sectionItems = items.filter((i) => i.section === section.name);
            if (!sectionItems.length) return null;
            return (
              <motion.div
                key={section._id}
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
                              onChange={() => toggleStock(item)}
                              className="mr-2"
                              style={{ accentColor: "#37EE00" }}
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
                          disabled={deletingId === item._id}
                          onClick={() => handleDeleteItem(item._id)}
                        >
                          {deletingId === item._id ? "..." : <IoTrash />}
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

      {/* Modal for Add/Edit */}
      <Modal
        isOpen={showItemForm}
        onClose={() => {
          setShowItemForm(false);
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Item" : "Add New Item"}
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