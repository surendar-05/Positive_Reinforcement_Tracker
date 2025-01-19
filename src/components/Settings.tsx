import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { Category } from '../types';

interface SettingsProps {
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
}

export function Settings({ categories, onUpdateCategories }: SettingsProps) {
  const [newCategory, setNewCategory] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      onUpdateCategories([
        ...categories,
        {
          id: crypto.randomUUID(),
          name: newCategory.trim(),
          color: newColor,
        },
      ]);
      setNewCategory('');
      setNewColor('#3b82f6');
    }
  };

  const handleRemoveCategory = (id: string) => {
    if (categories.length > 1) {
      onUpdateCategories(categories.filter((category) => category.id !== id));
    } else {
      alert('You must keep at least one category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Categories</h2>
        <form onSubmit={handleAddCategory} className="flex gap-4 mb-6">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
            required
          />
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="w-12 h-10 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newCategory.trim()}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Category
          </button>
        </form>

        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-gray-900">{category.name}</span>
              </div>
              <button
                onClick={() => handleRemoveCategory(category.id)}
                className="text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={categories.length <= 1}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}