import React, { useState } from 'react';
import { Gift, Lock, Trophy, Video, Book, Coffee, Gamepad, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { Reward } from '../types';

export const DEFAULT_REWARDS: Reward[] = [
  {
    id: '1',
    title: 'Netflix Time',
    description: 'Enjoy 1 hour of Netflix',
    icon: 'video',
    unlocked: false,
    isDefault: true
  },
  {
    id: '2',
    title: 'Gaming Break',
    description: '30 minutes of gaming',
    icon: 'gamepad',
    unlocked: false,
    isDefault: true
  },
  {
    id: '3',
    title: 'Coffee Break',
    description: 'Treat yourself to a nice coffee',
    icon: 'coffee',
    unlocked: false,
    isDefault: true
  },
  {
    id: '4',
    title: 'Reading Time',
    description: '30 minutes of reading your favorite book',
    icon: 'book',
    unlocked: false,
    isDefault: true
  }
];

interface RewardsProps {
  rewards: Reward[];
  onUpdateRewards: (rewards: Reward[]) => void;
  onUnlockReward: (reward: Reward) => void;
}

export function Rewards({ rewards, onUpdateRewards, onUnlockReward }: RewardsProps) {
  const [newReward, setNewReward] = useState({ title: '', description: '', icon: 'gift' });
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [showForm, setShowForm] = useState(false);

  const availableIcons = [
    { name: 'gift', component: Gift },
    { name: 'video', component: Video },
    { name: 'gamepad', component: Gamepad },
    { name: 'coffee', component: Coffee },
    { name: 'book', component: Book },
  ];

  const getIcon = (iconName: string) => {
    const IconComponent = availableIcons.find(i => i.name === iconName)?.component || Gift;
    return <IconComponent className="h-8 w-8" />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReward) {
      onUpdateRewards(
        rewards.map(r =>
          r.id === editingReward.id
            ? { ...r, ...newReward }
            : r
        )
      );
      setEditingReward(null);
    } else {
      onUpdateRewards([
        ...rewards,
        {
          ...newReward,
          id: crypto.randomUUID(),
          unlocked: false,
          isDefault: false,
        },
      ]);
    }
    setNewReward({ title: '', description: '', icon: 'gift' });
    setShowForm(false);
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setNewReward({
      title: reward.title,
      description: reward.description,
      icon: reward.icon,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    onUpdateRewards(rewards.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Rewards</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Create Custom Reward
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newReward.title}
                onChange={e => setNewReward({ ...newReward, title: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Icon</label>
              <select
                value={newReward.icon}
                onChange={e => setNewReward({ ...newReward, icon: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {availableIcons.map(icon => (
                  <option key={icon.name} value={icon.name}>
                    {icon.name.charAt(0).toUpperCase() + icon.name.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newReward.description}
                onChange={e => setNewReward({ ...newReward, description: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingReward(null);
                setNewReward({ title: '', description: '', icon: 'gift' });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {editingReward ? 'Update' : 'Create'} Reward
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className={`bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center
              ${reward.unlocked ? 'border-2 border-green-500' : 'opacity-75'}`}
          >
            <div className={`mb-4 text-${reward.unlocked ? 'green' : 'gray'}-500`}>
              {getIcon(reward.icon)}
            </div>
            <h3 className="text-lg font-semibold mb-2">{reward.title}</h3>
            <p className="text-gray-600 mb-4">{reward.description}</p>
            <div className="flex items-center space-x-2 mt-auto">
              {reward.unlocked ? (
                <button
                  onClick={() => onUnlockReward(reward)}
                  className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  Claim Reward
                </button>
              ) : (
                <div className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-600 rounded-md">
                  <Lock className="h-5 w-5 mr-2" />
                  Locked
                </div>
              )}
              {!reward.isDefault && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(reward)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(reward.id)}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}