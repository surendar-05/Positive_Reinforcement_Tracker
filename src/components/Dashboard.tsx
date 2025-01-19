import React from 'react';
import { BarChart, Calendar, Target } from 'lucide-react';
import { Action, Goal, Category } from '../types';

interface DashboardProps {
  actions: Action[];
  goals: Goal[];
  categories: Category[];
}

export function Dashboard({ actions, goals, categories }: DashboardProps) {
  const recentActions = actions.slice(0, 5);
  const activeGoals = goals.filter(goal => goal.current < goal.target);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Actions</h3>
          {recentActions.length > 0 ? (
            <ul className="space-y-3">
              {recentActions.map(action => (
                <li key={action.id} className="flex items-center justify-between">
                  <span className="text-gray-800">{action.title}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(action.timestamp).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No actions recorded yet</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Goal Progress</h3>
          {activeGoals.length > 0 ? (
            <ul className="space-y-4">
              {activeGoals.map(goal => (
                <li key={goal.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-800">{goal.title}</span>
                    <span className="text-sm text-gray-500">
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 rounded-full h-2"
                      style={{
                        width: `${(goal.current / goal.target) * 100}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No active goals</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}