export interface Action {
  id: string;
  title: string;
  timestamp: Date;
  category: string;
  deadline?: Date;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  category: string;
  deadline: Date;
  completed: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  isDefault?: boolean;
}

export interface Streak {
  categoryId: string;
  currentStreak: number;
  longestStreak: number;
  lastActionDate: Date;
}