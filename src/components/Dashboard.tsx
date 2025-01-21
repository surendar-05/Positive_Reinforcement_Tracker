import React from 'react';
import { BarChart, Calendar, Target, Flame, Trophy } from 'lucide-react';
import { Action, Goal, Category, Streak } from '../types';

interface DashboardProps {
  actions: Action[];
  goals: Goal[];
  categories: Category[];
  streaks: Streak[];
}

export function Dashboard({ actions, goals, categories, streaks }: DashboardProps) {
  const recentActions = actions.slice(0, 5);
  const activeGoals = goals.filter(goal => goal.current < goal.target);

  // Find the highest streak
  const topStreak = streaks.reduce((max, streak) => 
    streak.currentStreak > max.currentStreak ? streak : max, 
    { currentStreak: 0 } as Streak
  );

  const topCategory = categories.find(c => c.id === topStreak.categoryId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Actions"
          value={actions.length}
          icon={<Calendar className="h-6 w-6 text-blue-500" />}
        />
        <DashboardCard
          title="Active Goals"
          value={activeGoals.length}
          icon={<Target className="h-6 w-6 text-purple-500" />}
        />
        <DashboardCard
          title="Categories"
          value={categories.length}
          icon={<BarChart className="h-6 w-6 text-green-500" />}
        />
        <DashboardCard
          title="Top Streak"
          value={topStreak.currentStreak}
          subtitle={topCategory?.name}
          icon={<Flame className="h-6 w-6 text-orange-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Actions</h3>
          {recentActions.length > 0 ? (
            <ul className="space-y-3">
              {recentActions.map(action => {
                const category = categories.find(c => c.id === action.category);
                return (
                  <li key={action.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category?.color }}
                      />
                      <span className="text-gray-800">{action.title}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(action.timestamp).toLocaleDateString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500">No actions recorded yet</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Goal Progress</h3>
          {activeGoals.length > 0 ? (
            <ul className="space-y-4">
              {activeGoals.map(goal => {
                const category = categories.find(c => c.id === goal.category);
                const progress = (goal.current / goal.target) * 100;
                const isOverdue = goal.deadline && new Date(goal.deadline) < new Date();

                return (
                  <li key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: category?.color }}
                        />
                        <span className="text-gray-800">{goal.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {goal.current}/{goal.target}
                        </span>
                        {isOverdue && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`rounded-full h-2 transition-all duration-300 ${
                          isOverdue ? 'bg-red-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500">No active goals</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {categories.map(category => {
          const categoryStreak = streaks.find(s => s.categoryId === category.id);
          return (
            <div key={category.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: category.color }}>
                  {category.name}
                </h3>
                <Trophy className="h-5 w-5" style={{ color: category.color }} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-semibold">{categoryStreak?.currentStreak || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Longest Streak</span>
                  <span className="font-semibold">{categoryStreak?.longestStreak || 0} days</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon}
      </div>
    </div>
  );
}