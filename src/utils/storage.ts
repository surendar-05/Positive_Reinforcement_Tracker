// Local Storage Keys
const STORAGE_KEYS = {
  ACTIONS: 'tracker_actions',
  GOALS: 'tracker_goals',
  CATEGORIES: 'tracker_categories',
  REWARDS: 'tracker_rewards',
};

// Load data from localStorage
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Save data to localStorage
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Check for overdue items
export const checkDeadlines = (actions: Action[], goals: Goal[]) => {
  const now = new Date();
  const overdueActions = actions.filter(
    action => !action.completed && action.deadline && new Date(action.deadline) < now
  );
  const overdueGoals = goals.filter(
    goal => !goal.completed && goal.deadline && new Date(goal.deadline) < now
  );
  
  return { overdueActions, overdueGoals };
};

export { STORAGE_KEYS };