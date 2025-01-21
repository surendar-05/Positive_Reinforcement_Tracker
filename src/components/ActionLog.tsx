import React, { useState } from 'react';
import { PlusCircle, Pencil, Trash2, CheckCircle, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { Action, Category } from '../types';
import { generateTaskSuggestions } from '../utils/ai';

interface ActionLogProps {
  actions: Action[];
  categories: Category[];
  onAddAction: (action: Omit<Action, 'id' | 'timestamp' | 'completed'>) => void;
  onEditAction: (id: string, updates: Partial<Action>) => void;
  onDeleteAction: (id: string) => void;
  onCompleteAction: (id: string) => void;
}

export function ActionLog({
  actions,
  categories,
  onAddAction,
  onEditAction,
  onDeleteAction,
  onCompleteAction,
}: ActionLogProps) {
  const [newAction, setNewAction] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [deadline, setDeadline] = useState('');
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ title: string; category: string }>>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAction.trim() && selectedCategory) {
      if (editingAction) {
        onEditAction(editingAction.id, {
          title: newAction.trim(),
          category: selectedCategory,
          deadline: deadline ? new Date(deadline) : undefined,
        });
        setEditingAction(null);
      } else {
        onAddAction({
          title: newAction.trim(),
          category: selectedCategory,
          deadline: deadline ? new Date(deadline) : undefined,
        });
      }
      setNewAction('');
      setDeadline('');
    }
  };

  const handleGetSuggestions = async () => {
    setIsGeneratingSuggestions(true);
    try {
      const suggestions = await generateTaskSuggestions(
        categories,
        actions.slice(0, 10),
        []
      );
      setSuggestions(suggestions.filter(s => s.type === 'action'));
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: { title: string; category: string }) => {
    setNewAction(suggestion.title);
    setSelectedCategory(suggestion.category);
    setSuggestions([]);
  };

  const startEditing = (action: Action) => {
    setEditingAction(action);
    setNewAction(action.title);
    setSelectedCategory(action.category);
    setDeadline(action.deadline ? new Date(action.deadline).toISOString().slice(0, 16) : '');
  };

  const cancelEditing = () => {
    setEditingAction(null);
    setNewAction('');
    setSelectedCategory(categories[0]?.id || '');
    setDeadline('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-2 relative">
            <input
              type="text"
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="What did you accomplish?"
              className="w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
              required
            />
            <button
              type="button"
              onClick={handleGetSuggestions}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500"
              title="Get AI suggestions"
            >
              {isGeneratingSuggestions ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </button>
          </div>
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
          />
          <div className="col-span-4 flex gap-4">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newAction.trim() || !selectedCategory}
            >
              {editingAction ? (
                <>
                  <Pencil className="h-5 w-5 mr-2" />
                  Update Action
                </>
              ) : (
                <>
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Action
                </>
              )}
            </button>
            {editingAction && (
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
        
        {suggestions.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Suggestions:</h4>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                  className="w-full text-left px-4 py-2 bg-white rounded-md shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {suggestion.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {actions.map((action) => (
            <li
              key={action.id}
              className={`p-4 hover:bg-gray-50 ${
                action.completed ? 'bg-green-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        categories.find((c) => c.id === action.category)?.color ||
                        '#gray-400',
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {action.title}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{new Date(action.timestamp).toLocaleString()}</span>
                      {action.deadline && (
                        <div className="flex items-center text-orange-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Due: {new Date(action.deadline).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!action.completed && (
                    <>
                      <button
                        onClick={() => onCompleteAction(action.id)}
                        className="text-green-500 hover:text-green-600"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => startEditing(action)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onDeleteAction(action.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {actions.length === 0 && (
            <li className="p-4 text-center text-gray-500">
              No actions recorded yet
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}