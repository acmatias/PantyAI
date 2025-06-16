import React, { useState } from 'react';
import { Check, Edit3, Trash2, Plus, Camera, Package } from 'lucide-react';
import { PantryItem } from '../types';

interface ConfirmationViewProps {
  capturedImage: string;
  detectedItems: PantryItem[];
  onSave: (items: PantryItem[]) => void;
  onRetake: () => void;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  capturedImage,
  detectedItems,
  onSave,
  onRetake
}) => {
  const [items, setItems] = useState<PantryItem[]>(detectedItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleEdit = (item: PantryItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      setItems(items.map(item => 
        item.id === editingId ? { ...item, name: editName } : item
      ));
      setEditingId(null);
      setEditName('');
    }
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleAddItem = () => {
    const newItem: PantryItem = {
      id: Date.now().toString(),
      name: 'New Item',
      confidence: 1.0,
      category: 'Other'
    };
    setItems([...items, newItem]);
    handleEdit(newItem);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-emerald-600 bg-emerald-100';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Confirm Items</h1>
          <p className="text-gray-600 mt-1">Review and edit detected pantry items</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 grid gap-6 lg:grid-cols-2">
        {/* Captured Image */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <img
              src={capturedImage}
              alt="Captured pantry items"
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <button
                onClick={onRetake}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Retake Photo
              </button>
            </div>
          </div>
        </div>

        {/* Detected Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Detected Items ({items.length})
            </h2>
            <button
              onClick={handleAddItem}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 text-emerald-600 hover:text-emerald-700"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {item.category && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {item.category}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(item.confidence)}`}>
                            {Math.round(item.confidence * 100)}% confident
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No items detected</p>
              <button
                onClick={handleAddItem}
                className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Add items manually
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onRetake}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Retake Photo
            </button>
            <button
              onClick={() => onSave(items)}
              disabled={items.length === 0}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Save Items ({items.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};