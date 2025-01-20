import React, { useState } from 'react';
import { PlusCircle, Pencil, Trash2, ChevronRight, Calendar } from 'lucide-react';
import { Goal, Category } from '../types';

interface GoalsProps {
  goals: Goal[];
  categories: Category[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'current' | 'completed'>) => void;
  onEditGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateProgress: (goalId: string) => void;
}

export function Goals({
  goals,
  categories,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onUpdateProgress,
}: GoalsProps) {
  const [newGoal, setNewGoal] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [targetValue, setTargetValue] = useState<number>(1);
  const [deadline, setDeadline] = useState('');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim() && selectedCategory && targetValue > 0 && deadline) {
      if (editingGoal) {
        onEditGoal(editingGoal.id, {
          title: newGoal.trim(),
          category: selectedCategory,
          target: targetValue,
          deadline: new Date(deadline),
        });
        setEditingGoal(null);
      } else {
        onAddGoal({
          title: newGoal.trim(),
          category: selectedCategory,
          target: targetValue,
          deadline: new Date(deadline),
        });
      }
      setNewGoal('');
      setTargetValue(1);
      setDeadline('');
    }
  };

  const startEditing = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal(goal.title);
    setSelectedCategory(goal.category);
    setTargetValue(goal.target);
    setDeadline(goal.deadline ? new Date(goal.deadline).toISOString().slice(0, 16) : '');
  };

  const cancelEditing = () => {
    setEditingGoal(null);
    setNewGoal('');
    setSelectedCategory(categories[0]?.id || '');
    setTargetValue(1);
    setDeadline('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="What's your goal?"
            className="lg:col-span-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
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
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
            required
          />
          <div className="lg:col-span-4 flex gap-4">
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
              disabled={!newGoal.trim() || !selectedCategory || targetValue < 1 || !deadline}
            >
              {editingGoal ? (
                <>
                  <Pencil className="h-5 w-5 mr-2" />
                  Update Goal
                </>
              ) : (
                <>
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Goal
                </>
              )}
            </button>
            {editingGoal && (
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {goals.map((goal) => {
          const category = categories.find((c) => c.id === goal.category);
          const progress = (goal.current / goal.target) * 100;
          const isOverdue = goal.deadline && new Date(goal.deadline) < new Date();

          return (
            <div
              key={goal.id}
              className={`bg-white rounded-lg shadow p-6 ${
                goal.completed ? 'border-2 border-green-500' : ''
              } ${isOverdue ? 'border-2 border-red-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category?.color || '#gray-400' }}
                  />
                  <h3 className="text-lg font-medium">{goal.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {!goal.completed && (
                    <button
                      onClick={() => startEditing(goal)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress: {goal.current} / {goal.target}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute h-full rounded-full transition-all duration-300 ${
                      goal.completed ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-2">
                  <Calendar className="h- 4 w-4 mr-1" />
                  <span>Deadline: {new Date(goal.deadline).toLocaleString()}</span>
                </div>
                {!goal.completed && (
                  <button
                    onClick={() => onUpdateProgress(goal.id)}
                    className={`w-full mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    <ChevronRight className="h-5 w-5 mr-2" />
                    Progress
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="text-center text-gray-500 bg-white rounded-lg shadow p-6">
            No goals set yet
          </div>
        )}
      </div>
    </div>
  );
}