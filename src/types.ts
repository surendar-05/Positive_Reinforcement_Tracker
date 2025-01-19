export interface Action {
  id: string;
  title: string;
  timestamp: Date;
  category: string;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  category: string;
  deadline?: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}