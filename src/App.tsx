import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ActionLog } from './components/ActionLog';
import { Goals } from './components/Goals';
import { Settings } from './components/Settings';
import { Rewards, DEFAULT_REWARDS } from './components/Rewards';
import { Toast } from './components/Toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs';
import { Action, Goal, Category, Reward } from './types';
import { playSuccessSound, playActionSound } from './utils/sound';
import { loadFromStorage, saveToStorage, STORAGE_KEYS, checkDeadlines } from './utils/storage';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

function App() {
  const [actions, setActions] = useState<Action[]>(() => 
    loadFromStorage(STORAGE_KEYS.ACTIONS, [])
  );
  const [goals, setGoals] = useState<Goal[]>(() => 
    loadFromStorage(STORAGE_KEYS.GOALS, [])
  );
  const [categories, setCategories] = useState<Category[]>(() => 
    loadFromStorage(STORAGE_KEYS.CATEGORIES, [
      { id: '1', name: 'Exercise', color: '#22c55e' },
      { id: '2', name: 'Learning', color: '#3b82f6' },
      { id: '3', name: 'Mindfulness', color: '#a855f7' },
    ])
  );
  const [rewards, setRewards] = useState<Reward[]>(() =>
    loadFromStorage(STORAGE_KEYS.REWARDS, DEFAULT_REWARDS)
  );
  const [toast, setToast] = useState<Toast | null>(null);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIONS, actions);
  }, [actions]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GOALS, goals);
  }, [goals]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.REWARDS, rewards);
  }, [rewards]);

  // Check deadlines periodically
  useEffect(() => {
    const checkOverdue = () => {
      const { overdueActions, overdueGoals } = checkDeadlines(actions, goals);
      if (overdueActions.length > 0 || overdueGoals.length > 0) {
        showToast(`You have ${overdueActions.length + overdueGoals.length} overdue items!`, 'error');
      }
    };

    checkOverdue();
    const interval = setInterval(checkOverdue, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [actions, goals]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const addAction = (action: Omit<Action, 'id' | 'timestamp' | 'completed'>) => {
    const newAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      completed: false,
    };
    setActions(prev => [newAction, ...prev]);
    playActionSound();
    showToast('Action added successfully!', 'success');
  };

  const editAction = (id: string, updates: Partial<Action>) => {
    setActions(prev =>
      prev.map(action =>
        action.id === id ? { ...action, ...updates } : action
      )
    );
    showToast('Action updated successfully!', 'success');
  };

  const deleteAction = (id: string) => {
    setActions(prev => prev.filter(action => action.id !== id));
    showToast('Action deleted successfully!', 'success');
  };

  const completeAction = (id: string) => {
    setActions(prev =>
      prev.map(action =>
        action.id === id ? { ...action, completed: true } : action
      )
    );
    playSuccessSound();
    showToast('🎉 Action completed!', 'success');
    
    // Unlock a random reward occasionally
    if (Math.random() < 0.3) { // 30% chance
      const lockedRewards = rewards.filter(r => !r.unlocked);
      if (lockedRewards.length > 0) {
        const randomReward = lockedRewards[Math.floor(Math.random() * lockedRewards.length)];
        handleUpdateRewards(
          rewards.map(r =>
            r.id === randomReward.id ? { ...r, unlocked: true } : r
          )
        );
        showToast('🎁 You unlocked a new reward!', 'success');
      }
    }
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'current' | 'completed'>) => {
    const newGoal = {
      ...goal,
      id: crypto.randomUUID(),
      current: 0,
      completed: false,
    };
    setGoals(prev => [...prev, newGoal]);
    playActionSound();
    showToast('Goal added successfully!', 'success');
  };

  const editGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev =>
      prev.map(goal =>
        goal.id === id ? { ...goal, ...updates } : goal
      )
    );
    showToast('Goal updated successfully!', 'success');
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    showToast('Goal deleted successfully!', 'success');
  };

  const updateGoalProgress = (goalId: string) => {
    setGoals(prev => {
      const updatedGoals = prev.map(goal => {
        if (goal.id === goalId) {
          const newCurrent = Math.min(goal.current + 1, goal.target);
          const completed = newCurrent === goal.target;
          if (completed) {
            playSuccessSound();
            showToast('🎉 Congratulations! Goal completed!', 'success');
          } else {
            playActionSound();
          }
          return { ...goal, current: newCurrent, completed };
        }
        return goal;
      });
      return updatedGoals;
    });
  };

  const handleUpdateRewards = (updatedRewards: Reward[]) => {
    setRewards(updatedRewards);
    showToast('Rewards updated successfully!', 'success');
  };

  const handleUnlockReward = (reward: Reward) => {
    setRewards(prev =>
      prev.map(r =>
        r.id === reward.id ? { ...r, unlocked: false } : r
      )
    );
    showToast('Reward claimed successfully!', 'success');
    playSuccessSound();
  };

  return (
    <Layout>
      <Tabs defaultValue="dashboard" className="w-full max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Dashboard actions={actions} goals={goals} categories={categories} />
        </TabsContent>

        <TabsContent value="actions">
          <ActionLog
            actions={actions}
            categories={categories}
            onAddAction={addAction}
            onEditAction={editAction}
            onDeleteAction={deleteAction}
            onCompleteAction={completeAction}
          />
        </TabsContent>

        <TabsContent value="goals">
          <Goals
            goals={goals}
            categories={categories}
            onAddGoal={addGoal}
            onEditGoal={editGoal}
            onDeleteGoal={deleteGoal}
            onUpdateProgress={updateGoalProgress}
          />
        </TabsContent>

        <TabsContent value="rewards">
          <Rewards
            rewards={rewards}
            onUpdateRewards={handleUpdateRewards}
            onUnlockReward={handleUnlockReward}
          />
        </TabsContent>

        <TabsContent value="settings">
          <Settings
            categories={categories}
            onUpdateCategories={setCategories}
          />
        </TabsContent>
      </Tabs>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
}

export default App;