import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Action, Category } from '../types';

interface ActionLogProps {
  actions: Action[];
  categories: Category[];
  onAddAction: (action: Omit<Action, 'id' | 'timestamp'>) => void;
}

export function ActionLog({ actions, categories, onAddAction }: ActionLogProps) {
  const [newAction, setNewAction] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAction.trim() && selectedCategory) {
      onAddAction({
        title: newAction.trim(),
        category: selectedCategory,
      });
      setNewAction('');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            placeholder="What did you accomplish?"
            className="flex-1 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
            required
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newAction.trim() || !selectedCategory}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Action
          </button>
        </div>
      </form>

      {/* Rest of the component remains the same */}
    </div>
  );
}