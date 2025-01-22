import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ActionLog } from './components/ActionLog';
import { Goals } from './components/Goals';
import { Settings } from './components/Settings';
import { Rewards, DEFAULT_REWARDS } from './components/Rewards';
import { Toast } from './components/Toast';
import { Auth } from './components/Auth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs';
import { Action, Goal, Category, Reward, Streak } from './types';
import { playSuccessSound, playActionSound } from './utils/sound';
import { loadFromStorage, saveToStorage, STORAGE_KEYS, checkDeadlines } from './utils/storage';
import { calculateStreak } from './utils/streak';
import { useAuthStore } from './store/authStore';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

function App() {
  const { user, loading, initialize } = useAuthStore();
  const [actions, setActions] = useState<Action[]>(() => 
    loadFromStorage(STORAGE_KEYS.ACTIONS, [])
  );
  const [goals, setGoals] = useState<Goal[]>(() => 
    loadFromStorage(STORAGE_KEYS.GOALS, [])
  );
  const [categories, setCategories] = useState<Category[]>(() => 
    loadFromStorage(STORAGE_KEYS.CATEGORIES, [
      { id: '1', name: 'Exercise', color: '#22c55e', icon: 'dumbbell' },
      { id: '2', name: 'Learning', color: '#3b82f6', icon: 'book-open' },
      { id: '3', name: 'Mindfulness', color: '#a855f7', icon: 'brain' },
    ])
  );
  const [rewards, setRewards] = useState<Reward[]>(() =>
    loadFromStorage(STORAGE_KEYS.REWARDS, DEFAULT_REWARDS)
  );
  const [streaks, setStreaks] = useState<Streak[]>(() =>
    loadFromStorage(STORAGE_KEYS.STREAKS, [])
  );
  const [toast, setToast] = useState<Toast | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle offline/online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STREAKS, streaks);
  }, [streaks]);

  // Check deadlines periodically
  useEffect(() => {
    const checkOverdue = () => {
      const { overdueActions, overdueGoals } = checkDeadlines(actions, goals);
      if (overdueActions.length > 0 || overdueGoals.length > 0) {
        showToast(`You have ${overdueActions.length + overdueGoals.length} overdue items!`, 'error');
        // Request notification permission and show notification
        if (Notification.permission === 'granted') {
          new Notification('Overdue Items Alert!', {
            body: `You have ${overdueActions.length + overdueGoals.length} overdue items that need attention.`,
            icon: '/vite.svg'
          });
        }
      }
    };

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

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

    // Update streaks
    const categoryStreak = streaks.find(s => s.categoryId === action.category);
    if (categoryStreak) {
      const updatedStreak = calculateStreak(categoryStreak, new Date());
      setStreaks(prev => 
        prev.map(s => s.categoryId === action.category ? updatedStreak : s)
      );
    } else {
      setStreaks(prev => [...prev, {
        categoryId: action.category,
        currentStreak: 1,
        longestStreak: 1,
        lastActionDate: new Date(),
      }]);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Layout>
      {isOffline && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 fixed top-0 right-0 left-0 z-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You are currently offline. Changes will be saved locally and synced when you're back online.
              </p>
            </div>
          </div>
        </div>
      )}
      <Tabs defaultValue="dashboard" className="w-full max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Dashboard 
            actions={actions} 
            goals={goals} 
            categories={categories}
            streaks={streaks} 
          />
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