import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ActionLog } from './components/ActionLog';
import { Goals } from './components/Goals';
import { Settings } from './components/Settings';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs';
import { Action, Goal, Category } from './types';
import { playSuccessSound, playActionSound } from './utils/sound';

function App() {
  const [actions, setActions] = useState<Action[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Exercise', color: '#22c55e' },
    { id: '2', name: 'Learning', color: '#3b82f6' },
    { id: '3', name: 'Mindfulness', color: '#a855f7' },
  ]);

  const addAction = (action: Omit<Action, 'id' | 'timestamp'>) => {
    const newAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setActions(prev => [newAction, ...prev]);
    playActionSound();
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'current'>) => {
    const newGoal = {
      ...goal,
      id: crypto.randomUUID(),
      current: 0,
    };
    setGoals(prev => [...prev, newGoal]);
    playActionSound();
  };

  const updateGoalProgress = (goalId: string) => {
    setGoals(prev => {
      const updatedGoals = prev.map(goal => {
        if (goal.id === goalId) {
          const newCurrent = Math.min(goal.current + 1, goal.target);
          // Play success sound if goal is completed
          if (newCurrent === goal.target) {
            playSuccessSound();
          } else {
            playActionSound();
          }
          return { ...goal, current: newCurrent };
        }
        return goal;
      });
      return updatedGoals;
    });
  };

  return (
    <Layout>
      <Tabs defaultValue="dashboard" className="w-full max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
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
          />
        </TabsContent>

        <TabsContent value="goals">
          <Goals
            goals={goals}
            categories={categories}
            onAddGoal={addGoal}
            onUpdateProgress={updateGoalProgress}
          />
        </TabsContent>

        <TabsContent value="settings">
          <Settings
            categories={categories}
            onUpdateCategories={setCategories}
          />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

export default App;