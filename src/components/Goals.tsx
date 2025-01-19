import React, { useState } from 'react';
import { PlusCircle, ChevronRight } from 'lucide-react';
import { Goal, Category } from '../types';

interface GoalsProps {
  goals: Goal[];
  categories: Category[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'current'>) => void;
  onUpdateProgress: (goalId: string) => void;
}

export function Goals({ goals, categories, onAddGoal, onUpdateProgress }: GoalsProps) {
  const [newGoal, setNewGoal] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [targetValue, setTargetValue] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim() && selectedCategory && targetValue > 0) {
      onAddGoal({
        title: newGoal.trim(),
        category: selectedCategory,
        target: targetValue,
      });
      setNewGoal('');
      setTargetValue(1);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="What's your goal?"
            className="col-span-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
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
          <div className="flex gap-4">
            <input
              type="number"
              min="1"
              value={targetValue}
              onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
              required
            />
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newGoal.trim() || !selectedCategory || targetValue < 1}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add Goal
            </button>
          </div>
        </div>
      </form>

      {/* Rest of the component remains the same */}
    </div>
  );
}